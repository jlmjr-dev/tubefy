/** A YouTube search hit considered as a match for a track. */
export interface VideoCandidate {
  videoId: string
  title: string
  channelTitle: string
  durationSec: number
  durationLabel: string
  viewCountLabel?: string
  thumbnailUrl?: string
}

/** A video queued for playback in the player. */
export interface QueueVideo {
  videoId: string
  title: string
  channelTitle: string
  durationLabel: string
  thumbnailUrl?: string
}
