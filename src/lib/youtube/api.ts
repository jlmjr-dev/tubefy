import { formatSeconds, formatViewCount, parseIsoDuration } from "@/lib/format"
import type { Playlist, QueueVideo, VideoCandidate } from "@/lib/types"
import { getYouTubeToken } from "@/lib/youtube/auth"

const API = "https://www.googleapis.com/youtube/v3"

interface Thumbnails {
  default?: { url: string }
  medium?: { url: string }
  high?: { url: string }
}

function pickThumbnail(thumbs?: Thumbnails): string | undefined {
  return thumbs?.medium?.url ?? thumbs?.high?.url ?? thumbs?.default?.url
}

async function ytGet<T>(path: string, attempt = 0): Promise<T> {
  const token = await getYouTubeToken()
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.ok) return res.json() as Promise<T>
  // Retry transient failures (rate limit / server hiccup) with backoff. Quota
  // (403) and other 4xx are not retried.
  if ((res.status === 429 || res.status >= 500) && attempt < 2) {
    await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)))
    return ytGet<T>(path, attempt + 1)
  }
  throw new Error(await ytError(res))
}

async function ytPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getYouTubeToken()
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await ytError(res))
  return res.json() as Promise<T>
}

async function ytError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    return data?.error?.message
      ? `YouTube: ${data.error.message}`
      : `YouTube request failed (${res.status}).`
  } catch {
    return `YouTube request failed (${res.status}).`
  }
}

interface PlaylistResponse {
  items?: {
    id: string
    snippet: { title: string; thumbnails?: Thumbnails }
    contentDetails?: { itemCount: number }
  }[]
  nextPageToken?: string
}

/** All of the signed-in user's YouTube playlists. */
export async function getYouTubePlaylists(): Promise<Playlist[]> {
  const playlists: Playlist[] = []
  let pageToken = ""
  do {
    const page: PlaylistResponse = await ytGet(
      `/playlists?part=snippet,contentDetails&mine=true&maxResults=50${
        pageToken ? `&pageToken=${pageToken}` : ""
      }`
    )
    for (const item of page.items ?? []) {
      playlists.push({
        id: item.id,
        title: item.snippet.title,
        itemCount: item.contentDetails?.itemCount ?? 0,
        thumbnailUrl: pickThumbnail(item.snippet.thumbnails),
        source: "youtube",
      })
    }
    pageToken = page.nextPageToken ?? ""
  } while (pageToken)
  return playlists
}

interface PlaylistItemsResponse {
  items?: {
    contentDetails?: { videoId: string }
    snippet: {
      title: string
      channelTitle?: string
      videoOwnerChannelTitle?: string
      thumbnails?: Thumbnails
    }
  }[]
  nextPageToken?: string
}

/** The videos in a playlist, enriched with durations, ready to queue. */
export async function getYouTubePlaylistItems(
  playlistId: string,
  limit = 100
): Promise<QueueVideo[]> {
  const rows: Omit<QueueVideo, "durationLabel">[] = []
  let pageToken = ""
  do {
    const page: PlaylistItemsResponse = await ytGet(
      `/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}${
        pageToken ? `&pageToken=${pageToken}` : ""
      }`
    )
    for (const item of page.items ?? []) {
      const videoId = item.contentDetails?.videoId
      if (!videoId) continue
      rows.push({
        videoId,
        title: item.snippet.title,
        channelTitle:
          item.snippet.videoOwnerChannelTitle ?? item.snippet.channelTitle ?? "",
        thumbnailUrl: pickThumbnail(item.snippet.thumbnails),
      })
      if (rows.length >= limit) break
    }
    pageToken = page.nextPageToken ?? ""
  } while (pageToken && rows.length < limit)

  const durations = await getVideoDurations(rows.map((r) => r.videoId))
  return rows.map((row) => ({
    ...row,
    durationLabel: durations.has(row.videoId)
      ? formatSeconds(durations.get(row.videoId)!)
      : "",
  }))
}

interface VideosResponse {
  items?: {
    id: string
    snippet?: { title: string; channelTitle: string; thumbnails?: Thumbnails }
    contentDetails?: { duration: string }
    statistics?: { viewCount?: string }
  }[]
}

/** Batched videos.list (up to 50 ids/call) returning seconds per video id. */
async function getVideoDurations(ids: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50)
    if (chunk.length === 0) continue
    const res: VideosResponse = await ytGet(
      `/videos?part=contentDetails&id=${chunk.join(",")}`
    )
    for (const item of res.items ?? []) {
      if (item.contentDetails?.duration) {
        map.set(item.id, parseIsoDuration(item.contentDetails.duration))
      }
    }
  }
  return map
}

interface SearchResponse {
  items?: {
    id: { videoId: string }
    snippet: { title: string; channelTitle: string; thumbnails?: Thumbnails }
  }[]
}

/**
 * Search the Music category for a track and enrich the hits with duration /
 * views. One search call (the scarce quota) plus one batched videos.list.
 */
export async function searchCandidates(
  query: string,
  maxResults = 5
): Promise<VideoCandidate[]> {
  const search: SearchResponse = await ytGet(
    `/search?part=snippet&type=video&videoCategoryId=10&maxResults=${maxResults}&q=${encodeURIComponent(
      query
    )}`
  )
  const hits = (search.items ?? []).filter((item) => item.id?.videoId)
  if (hits.length === 0) return []

  const details: VideosResponse = await ytGet(
    `/videos?part=contentDetails,snippet,statistics&id=${hits
      .map((h) => h.id.videoId)
      .join(",")}`
  )
  const byId = new Map(details.items?.map((item) => [item.id, item]) ?? [])

  return hits.map((hit) => {
    const detail = byId.get(hit.id.videoId)
    const durationSec = detail?.contentDetails?.duration
      ? parseIsoDuration(detail.contentDetails.duration)
      : 0
    const views = detail?.statistics?.viewCount
      ? Number(detail.statistics.viewCount)
      : undefined
    return {
      videoId: hit.id.videoId,
      title: detail?.snippet?.title ?? hit.snippet.title,
      channelTitle: detail?.snippet?.channelTitle ?? hit.snippet.channelTitle,
      durationSec,
      durationLabel: durationSec ? formatSeconds(durationSec) : "",
      viewCountLabel: views != null ? formatViewCount(views) : undefined,
      thumbnailUrl: pickThumbnail(hit.snippet.thumbnails),
    }
  })
}

interface InsertPlaylistResponse {
  id: string
}

/** Create a new (private) playlist on the user's channel. Returns its id. */
export async function createYouTubePlaylist(
  title: string,
  description: string
): Promise<string> {
  const res: InsertPlaylistResponse = await ytPost("/playlists?part=snippet,status", {
    snippet: { title, description },
    status: { privacyStatus: "private" },
  })
  return res.id
}

/** Append one video to a playlist. */
export async function addVideoToYouTubePlaylist(
  playlistId: string,
  videoId: string
): Promise<void> {
  await ytPost("/playlistItems?part=snippet", {
    snippet: {
      playlistId,
      resourceId: { kind: "youtube#video", videoId },
    },
  })
}
