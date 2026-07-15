import type { Mapping } from "@/lib/types"
import {
  addVideoToYouTubePlaylist,
  createYouTubePlaylist,
} from "@/lib/youtube/api"

/**
 * Build the reviewed playlist on the user's YouTube: create it, then insert each
 * chosen video in order. Returns the new playlist id. Inserts are sequential to
 * preserve order (and stay friendly to quota).
 */
export async function buildYouTubePlaylist(
  sourceName: string,
  mappings: Mapping[],
  onProgress?: (done: number, total: number) => void
): Promise<string> {
  const videos = mappings
    .map((mapping) => mapping.candidates[mapping.chosenIndex])
    .filter((video): video is NonNullable<typeof video> => Boolean(video))

  const playlistId = await createYouTubePlaylist(
    `${sourceName} (Tubefy)`,
    `Created by Tubefy from the Spotify playlist "${sourceName}".`
  )

  let done = 0
  for (const video of videos) {
    await addVideoToYouTubePlaylist(playlistId, video.videoId)
    done += 1
    onProgress?.(done, videos.length)
  }

  return playlistId
}
