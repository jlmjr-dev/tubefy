import type { Confidence, Track, VideoCandidate } from "@/domain/types"

/**
 * Heuristics for picking the right music video for a Spotify track. We score each
 * YouTube candidate on: duration proximity, channel type (Official Artist / VEVO
 * / "- Topic" art tracks beat fan uploads), title similarity, an explicit
 * "official video" signal in the title, and a heavy penalty for covers /
 * karaoke and other non-canonical variants (live, acoustic, remix, ...) so the
 * canonical official upload wins.
 */

// Phrases that mark the real, label-published upload.
const OFFICIAL_TITLE_PHRASES = [
  "official music video",
  "official video",
  "official audio",
  "official lyric video",
  "official visualizer",
  "official hd video",
]

// Covers / karaoke / tributes: not the original recording. Penalized hard so
// they sink below any real match and are never auto-selected.
const COVER_KEYWORDS = [
  "cover",
  "covered",
  "tribute",
  "karaoke",
  "in the style of",
  "made famous by",
  "as made famous by",
  "originally by",
]

// Non-canonical variants of the real recording.
const VARIANT_KEYWORDS = [
  "live",
  "acoustic",
  "remix",
  "sped up",
  "slowed",
  "reverb",
  "8d",
  "nightcore",
  "instrumental",
  "mashup",
  "parody",
]

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Whole-word (boundary-aware) containment. Avoids substring false positives
 * like "Sia" matching "Asia" or "live" matching "deliverance".
 */
function containsWord(haystack: string, needle: string): boolean {
  if (needle.length < 2) return false
  const escaped = needle.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^|\\W)${escaped}(\\W|$)`).test(haystack.toLowerCase())
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

function isOfficialChannel(track: Track, candidate: VideoCandidate): boolean {
  const channel = candidate.channelTitle.toLowerCase()
  // "- Topic" and "VEVO" are distinctive enough to match as substrings (VEVO is
  // often concatenated, e.g. "ArtistVEVO"); the artist name needs word bounds.
  const isTopic = channel.includes("- topic")
  const isVevo = channel.includes("vevo")
  const isOfficialArtist = containsWord(channel, track.primaryArtist)
  return isTopic || isVevo || isOfficialArtist
}

function hasOfficialTitle(candidate: VideoCandidate): boolean {
  const title = candidate.title.toLowerCase()
  return OFFICIAL_TITLE_PHRASES.some((phrase) => title.includes(phrase))
}

/** A keyword present in the candidate title but not implied by the track. */
function unimpliedKeyword(track: Track, candidate: VideoCandidate, keywords: string[]) {
  const trackText = `${track.title} ${track.album ?? ""}`
  return keywords.some(
    (kw) => containsWord(candidate.title, kw) && !containsWord(trackText, kw)
  )
}

function isCover(track: Track, candidate: VideoCandidate): boolean {
  return unimpliedKeyword(track, candidate, COVER_KEYWORDS)
}

function isVariant(track: Track, candidate: VideoCandidate): boolean {
  return unimpliedKeyword(track, candidate, VARIANT_KEYWORDS)
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

  score += isOfficialChannel(track, candidate) ? 34 : -6

  score += titleSimilarity(track, candidate) * 25

  // Prefer the explicitly-official upload; a bare "official" word counts less.
  if (hasOfficialTitle(candidate)) score += 22
  else if (containsWord(candidate.title, "official")) score += 6

  // Sink covers/karaoke far below any real match; lightly demote other variants.
  if (isCover(track, candidate)) score -= 45
  if (isVariant(track, candidate)) score -= 16

  return score
}

/** Whether the chosen candidate is a confident match or one to review. */
export function confidenceFor(track: Track, candidate: VideoCandidate): Confidence {
  const durationOk = Math.abs(candidate.durationSec - track.durationMs / 1000) <= 3
  const official = isOfficialChannel(track, candidate)
  const similar = titleSimilarity(track, candidate) >= 0.6
  const clean = !isCover(track, candidate) && !isVariant(track, candidate)
  return durationOk && official && similar && clean ? "strong" : "review"
}
