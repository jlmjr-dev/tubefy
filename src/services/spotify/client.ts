import { config } from "@/shared/lib/config"
import { formatMs } from "@/shared/lib/format"
import type { PlatformProfile, Playlist, Track } from "@/domain/types"
import { request } from "@/services/http"
import { demoTracks } from "@/services/demo/fixtures"
import { getSpotifyToken } from "@/services/spotify/auth"

const API = "https://api.spotify.com/v1"

interface Paged<T> {
  items: T[]
  next: string | null
  total: number
}

interface SpotifyPlaylist {
  id: string
  name: string
  images?: { url: string }[]
  owner?: { display_name?: string; id?: string }
  tracks?: { total: number }
}

interface SpotifyTrack {
  id: string | null
  name: string
  duration_ms: number
  album?: { name?: string }
  artists: { name: string }[]
  external_ids?: { isrc?: string }
}

interface SpotifyProfile {
  display_name?: string
  id?: string
  images?: { url: string }[]
}

async function spotifyGet<T>(path: string): Promise<T> {
  const token = await getSpotifyToken()
  return request<T>(`${API}${path}`, { label: "Spotify", token })
}

/** The signed-in user's Spotify display name, avatar, and playlist count. */
export async function fetchSpotifyProfile(): Promise<PlatformProfile> {
  const [me, playlists] = await Promise.all([
    spotifyGet<SpotifyProfile>("/me"),
    spotifyGet<{ total: number }>("/me/playlists?limit=1"),
  ])
  return {
    name: me.display_name || me.id || "Spotify",
    avatarUrl: me.images?.[0]?.url,
    playlistCount: playlists.total,
  }
}

/** A single playlist's name (used when arriving at matching without route state). */
export async function getSpotifyPlaylistName(playlistId: string): Promise<string> {
  if (config.demo) return "Classic Prog Metal"
  const data = await spotifyGet<{ name: string }>(
    `/playlists/${playlistId}?fields=name`
  )
  return data.name
}

/** All of the user's playlists (private, collaborative, and followed). */
export async function getSpotifyPlaylists(): Promise<Playlist[]> {
  const playlists: Playlist[] = []
  let path: string | null = "/me/playlists?limit=50"
  while (path) {
    const page: Paged<SpotifyPlaylist> = await spotifyGet(path)
    for (const item of page.items) {
      if (!item) continue
      playlists.push({
        id: item.id,
        title: item.name,
        owner: item.owner?.display_name || item.owner?.id,
        itemCount: item.tracks?.total ?? 0,
        thumbnailUrl: item.images?.[0]?.url,
        source: "spotify",
      })
    }
    path = page.next ? page.next.replace(API, "") : null
  }
  return playlists
}

/** Tracks of a playlist (up to `limit`), flattened to Tubefy's Track shape. */
export async function getSpotifyTracks(
  playlistId: string,
  limit = 100
): Promise<Track[]> {
  if (config.demo) return demoTracks.slice(0, limit)
  const tracks: Track[] = []
  const fields =
    "next,items(track(id,name,duration_ms,album(name),artists(name),external_ids(isrc)))"
  let path: string | null = `/playlists/${playlistId}/tracks?limit=100&fields=${encodeURIComponent(fields)}`

  while (path && tracks.length < limit) {
    const page: Paged<{ track: SpotifyTrack | null }> = await spotifyGet(path)
    for (const item of page.items) {
      const track = item.track
      if (!track || !track.id) continue
      const names = track.artists.map((a) => a.name)
      tracks.push({
        id: track.id,
        title: track.name,
        artists: names.join(", "),
        primaryArtist: names[0] ?? "",
        album: track.album?.name,
        durationMs: track.duration_ms,
        durationLabel: formatMs(track.duration_ms),
        isrc: track.external_ids?.isrc,
      })
      if (tracks.length >= limit) break
    }
    path = page.next ? page.next.replace(API, "") : null
  }
  return tracks
}
