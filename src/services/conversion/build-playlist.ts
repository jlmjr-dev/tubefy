import type { Mapping } from "@/domain/types"
import {
  addVideoToYouTubePlaylist,
  createYouTubePlaylist,
} from "@/services/youtube/client"

interface BuildOptions {
  /** Reuse an already-created playlist (set on retry to avoid duplicates). */
  existingPlaylistId?: string
  /** Resume inserting from this index (videos before it already inserted). */
  startIndex?: number
  /** Called once with the playlist id right after it is created. */
  onCreated?: (playlistId: string) => void
  /** Called after each successful insert with the running total inserted. */
  onProgress?: (inserted: number) => void
}

/**
 * Build the reviewed playlist on the user's YouTube: create it, then insert each
 * chosen video in order. Inserts are sequential to preserve order (and stay
 * friendly to quota). Idempotent-friendly: if a build fails partway, pass the
 * created id + inserted count back in to resume instead of creating a duplicate.
 */
export async function buildYouTubePlaylist(
  sourceName: string,
  mappings: Mapping[],
  options: BuildOptions = {}
): Promise<{ playlistId: string; inserted: number }> {
  const videos = mappings
    .map((mapping) => mapping.candidates[mapping.chosenIndex])
    .filter((video): video is NonNullable<typeof video> => Boolean(video))

  let playlistId = options.existingPlaylistId
  if (!playlistId) {
    playlistId = await createYouTubePlaylist(
      `${sourceName} (Tubefy)`,
      `Created by Tubefy from the Spotify playlist "${sourceName}".`
    )
    options.onCreated?.(playlistId)
  }

  let inserted = options.startIndex ?? 0
  for (let i = inserted; i < videos.length; i++) {
    await addVideoToYouTubePlaylist(playlistId, videos[i].videoId)
    inserted = i + 1
    options.onProgress?.(inserted)
  }

  return { playlistId, inserted }
}
