import type { Track } from "@/domain/types/track"
import type { VideoCandidate } from "@/domain/types/video"

export type Confidence = "strong" | "review"

/** One Spotify track resolved to its ranked YouTube candidates. */
export interface Mapping {
  track: Track
  candidates: VideoCandidate[]
  chosenIndex: number
  confidence: Confidence
}
