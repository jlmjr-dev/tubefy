export type Platform = "spotify" | "youtube"

export interface Playlist {
  id: string
  title: string
  owner?: string
  itemCount: number
  thumbnailUrl?: string
  source: Platform
  /** Human duration label when known. */
  durationLabel?: string
}

export interface Track {
  id: string
  title: string
  /** All artists joined for display, e.g. "Artist A, Artist B". */
  artists: string
  primaryArtist: string
  album?: string
  durationMs: number
  durationLabel: string
  isrc?: string
}

export interface VideoCandidate {
  videoId: string
  title: string
  channelTitle: string
  durationSec: number
  durationLabel: string
  viewCountLabel?: string
  thumbnailUrl?: string
}

export type Confidence = "strong" | "review"

export interface Mapping {
  track: Track
  candidates: VideoCandidate[]
  chosenIndex: number
  confidence: Confidence
}

export interface QueueVideo {
  videoId: string
  title: string
  channelTitle: string
  durationLabel: string
  thumbnailUrl?: string
}
