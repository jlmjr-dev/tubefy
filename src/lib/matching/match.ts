import type { Mapping, Track } from "@/lib/types"
import { searchCandidates } from "@/lib/youtube/api"
import { confidenceFor, scoreCandidate } from "@/lib/matching/score"

/**
 * Resolve one Spotify track to its best YouTube music video plus alternates.
 * Searches the Music category, ranks the hits, and keeps them all so the review
 * step can offer the runners-up. The best-scoring candidate becomes chosenIndex 0.
 */
export async function matchTrack(track: Track): Promise<Mapping> {
  const query = `${track.primaryArtist} ${track.title}`.trim()
  const candidates = await searchCandidates(query, 5)

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
