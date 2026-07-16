import type { Confidence, Track, VideoCandidate } from "@/domain/types"

/**
 * Heuristics for picking the right music video for a Spotify track, tuned for a
 * WATCH playlist: the artist's official music video should win even when its
 * length differs from the album cut (videos add intros/outros). So we reward
 * official channels and explicit "official ... video" titles heavily, treat
 * duration as a gentle sanity check (audio / remaster / random album cuts often
 * match the exact length yet are not the video), demote audio/lyrics-only
 * uploads, and sink covers / karaoke / live / remaster variants.
 */

// The actual music video: what a watch playlist wants. Decisive.
const OFFICIAL_VIDEO_PHRASES = [
  "official music video",
  "official video",
  "official hd video",
  "official 4k video",
  "official mv",
  "official visualizer",
]

// Covers / karaoke / tributes: not the original recording. Sunk.
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

// Non-canonical versions of the real recording; a watch playlist wants the
// studio video, not a live/remaster/TV performance.
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
  "top of the pops",
  "remaster",
  "remastered",
  "re-recorded",
  "rerecorded",
]

// Official but not the video (audio / lyric uploads): acceptable as a fallback,
// but demoted so a real music video always wins.
const NON_VIDEO_KEYWORDS = ["audio", "lyric", "lyrics"]

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

function isOfficialVideoTitle(candidate: VideoCandidate): boolean {
  const title = candidate.title.toLowerCase()
  return OFFICIAL_VIDEO_PHRASES.some((phrase) => title.includes(phrase))
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

function isAudioOrLyrics(track: Track, candidate: VideoCandidate): boolean {
  return unimpliedKeyword(track, candidate, NON_VIDEO_KEYWORDS)
}

/** Higher is better. Used to rank candidates for one track. */
export function scoreCandidate(track: Track, candidate: VideoCandidate): number {
  let score = 0

  // Duration is a gentle sanity check, not the deciding factor: official videos
  // are often 30-60s longer than the album cut, so only punish extreme gaps.
  const trackSec = track.durationMs / 1000
  const diff = Math.abs(candidate.durationSec - trackSec)
  if (diff <= 5) score += 12
  else if (diff <= 20) score += 6
  else if (diff <= 60) score += 0
  else score -= 25

  score += isOfficialChannel(track, candidate) ? 40 : -15

  score += titleSimilarity(track, candidate) * 20

  // An explicit "official ... video" title is the strongest "this is THE video"
  // signal; a bare "official" word counts a little.
  if (isOfficialVideoTitle(candidate)) score += 45
  else if (containsWord(candidate.title, "official")) score += 8

  // Official-but-not-the-video (audio / lyrics) loses to a real music video.
  if (isAudioOrLyrics(track, candidate)) score -= 12

  // Sink covers/karaoke far below any real match; demote other variants.
  if (isCover(track, candidate)) score -= 60
  if (isVariant(track, candidate)) score -= 22

  return score
}

/** Whether the chosen candidate is a confident match or one to review. */
export function confidenceFor(track: Track, candidate: VideoCandidate): Confidence {
  const official = isOfficialChannel(track, candidate)
  const similar = titleSimilarity(track, candidate) >= 0.6
  const video = isOfficialVideoTitle(candidate)
  const durationOk = Math.abs(candidate.durationSec - track.durationMs / 1000) <= 15
  const clean =
    !isCover(track, candidate) &&
    !isVariant(track, candidate) &&
    !isAudioOrLyrics(track, candidate)
  // Confident when it's an official, clean match that is either the labelled
  // video or close to the album length.
  return official && similar && clean && (video || durationOk) ? "strong" : "review"
}
