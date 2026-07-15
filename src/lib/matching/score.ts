import type { Confidence, Track, VideoCandidate } from "@/lib/types"

/**
 * Heuristics for picking the right music video for a Spotify track. We score each
 * YouTube candidate on three signals the handoff calls out: duration proximity,
 * channel type (Official Artist / VEVO / "- Topic" art tracks beat fan uploads),
 * and title similarity (penalizing cover / live / lyric / sped-up unless the
 * Spotify track itself implies them).
 */

const NEGATIVE_KEYWORDS = [
  "cover",
  "live",
  "lyric",
  "sped up",
  "slowed",
  "remix",
  "8d",
  "reverb",
  "instrumental",
  "karaoke",
  "nightcore",
  "acoustic",
]

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

/** Fraction of the track's title tokens present in the candidate title (0..1). */
export function titleSimilarity(track: Track, candidate: VideoCandidate): number {
  const wanted = new Set(tokenize(track.title))
  if (wanted.size === 0) return 0
  const found = new Set(tokenize(candidate.title))
  let hits = 0
  for (const token of wanted) if (found.has(token)) hits++
  return hits / wanted.size
}

function channelSignals(track: Track, candidate: VideoCandidate) {
  const channel = candidate.channelTitle.toLowerCase()
  const artist = track.primaryArtist.toLowerCase()
  const isTopic = channel.includes("- topic")
  const isVevo = channel.includes("vevo")
  const isOfficialArtist = artist.length > 1 && channel.includes(artist)
  return { official: isTopic || isVevo || isOfficialArtist }
}

function badKeyword(track: Track, candidate: VideoCandidate): boolean {
  const title = candidate.title.toLowerCase()
  const trackText = `${track.title} ${track.album ?? ""}`.toLowerCase()
  return NEGATIVE_KEYWORDS.some((kw) => title.includes(kw) && !trackText.includes(kw))
}

/** Higher is better. Used to rank candidates for one track. */
export function scoreCandidate(track: Track, candidate: VideoCandidate): number {
  let score = 0

  const trackSec = track.durationMs / 1000
  const diff = Math.abs(candidate.durationSec - trackSec)
  if (diff <= 2) score += 50
  else if (diff <= 5) score += 30
  else if (diff <= 12) score += 10
  else score -= 20

  const { official } = channelSignals(track, candidate)
  score += official ? 32 : -5

  score += titleSimilarity(track, candidate) * 25

  const title = candidate.title.toLowerCase()
  if (title.includes("official")) score += 6
  if (badKeyword(track, candidate)) score -= 14

  return score
}

/** Whether the chosen candidate is a confident match or one to review. */
export function confidenceFor(track: Track, candidate: VideoCandidate): Confidence {
  const durationOk = Math.abs(candidate.durationSec - track.durationMs / 1000) <= 3
  const { official } = channelSignals(track, candidate)
  const similar = titleSimilarity(track, candidate) >= 0.6
  return durationOk && official && similar && !badKeyword(track, candidate)
    ? "strong"
    : "review"
}
