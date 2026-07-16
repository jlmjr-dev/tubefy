import type { Mapping, Track } from "@/domain/types"
import { messageOf } from "@/shared/lib/errors"
import { matchTrack } from "@/services/conversion/match-track"

export interface RunMatchingOptions {
  /** How many track lookups run at once. A modest pool keeps the pipe full
   * without hammering YouTube's rate limits. */
  concurrency?: number
  /** Called as each track resolves (in completion order), for streaming UI. */
  onResult?: (mapping: Mapping, index: number) => void
}

export interface RunMatchingResult {
  /** One mapping per input track, in the original track order. */
  mappings: Mapping[]
  /** The first real lookup error, if any (e.g. an exhausted quota), so the UI
   * can explain a systemic failure instead of a silent "no match". */
  firstError: string | null
}

/**
 * Resolve every Spotify track to its best YouTube video using a small pool of
 * concurrent workers. Results stay in track order; a single failed lookup
 * degrades to an empty "review" mapping rather than sinking the whole batch.
 */
export async function runMatching(
  tracks: Track[],
  { concurrency = 4, onResult }: RunMatchingOptions = {}
): Promise<RunMatchingResult> {
  const mappings: Mapping[] = new Array(tracks.length)
  let cursor = 0
  let firstError: string | null = null

  async function worker() {
    for (let i = cursor++; i < tracks.length; i = cursor++) {
      const track = tracks[i]
      let mapping: Mapping
      try {
        mapping = await matchTrack(track)
      } catch (err) {
        if (!firstError) firstError = messageOf(err)
        mapping = { track, candidates: [], chosenIndex: 0, confidence: "review" }
      }
      mappings[i] = mapping
      onResult?.(mapping, i)
    }
  }

  const poolSize = Math.min(concurrency, tracks.length)
  await Promise.all(Array.from({ length: poolSize }, worker))
  return { mappings, firstError }
}
