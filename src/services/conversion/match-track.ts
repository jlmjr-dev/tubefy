import type { Mapping, Track } from "@/domain/types"
import { searchCandidates } from "@/services/youtube/client"
import { confidenceFor, scoreCandidate } from "@/domain/matching/score"

/**
 * Resolve one Spotify track to its best YouTube music video plus alternates.
 * Searches the Music category, ranks the hits, and keeps them all so the review
 * step can offer the runners-up. The best-scoring candidate becomes chosenIndex 0.
 */
export async function matchTrack(track: Track): Promise<Mapping> {
  const query = `${track.primaryArtist} ${track.title}`.trim()
  // Pull a few more hits so the official video (often not YouTube's top result)
  // is in the running. One search call regardless of count, so no extra quota.
  const candidates = await searchCandidates(query, 8)

  if (candidates.length === 0) {
    return { track, candidates: [], chosenIndex: 0, confidence: "review" }
  }

  const ranked = [...candidates].sort(
    (a, b) => scoreCandidate(track, b) - scoreCandidate(track, a)
  )
  return {
    track,
    candidates: ranked,
    chosenIndex: 0,
    confidence: confidenceFor(track, ranked[0]),
  }
}
