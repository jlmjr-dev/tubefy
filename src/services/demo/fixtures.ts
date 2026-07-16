import type {
  Mapping,
  PlatformProfile,
  Playlist,
  QueueVideo,
  Track,
  VideoCandidate,
} from "@/domain/types"

/**
 * Committed fixtures for demo/QA mode (`pnpm demo`). A metal-flavoured slice of
 * the app with no OAuth or real API calls, reused for click-through QA, tests,
 * and screenshots. Cover art lives in public/demo.
 */

export const demoProfile: PlatformProfile = { name: "Jose Monteiro" }

/** YouTube "jump back in" shelf: single-cover playlists. */
export const demoYouTubePlaylists: Playlist[] = [
  { id: "yt-prog", title: "Prog Metal Nights", itemCount: 42, thumbnailUrl: "/demo/prog-metal-nights.jpg", source: "youtube" },
  { id: "yt-core", title: "Metalcore Anthems", itemCount: 28, thumbnailUrl: "/demo/metalcore-anthems.jpg", source: "youtube" },
  { id: "yt-melo", title: "Melodeath Classics", itemCount: 35, thumbnailUrl: "/demo/melodeath-classics.jpg", source: "youtube" },
  { id: "yt-djent", title: "Djent & Groove", itemCount: 19, thumbnailUrl: "/demo/djent-and-groove.jpg", source: "youtube" },
  { id: "yt-doom", title: "Doom & Sludge", itemCount: 23, thumbnailUrl: "/demo/doom-and-sludge.jpg", source: "youtube" },
]

/** Spotify "ready to convert" shelf: 2x2 album-mosaic covers, like Spotify. */
export const demoSpotifyPlaylists: Playlist[] = [
  { id: "sp-classic", title: "Classic Prog Metal", owner: "Jose Monteiro", itemCount: 30, thumbnailUrl: "/demo/classic-prog-metal.jpg", source: "spotify" },
  { id: "sp-core", title: "Modern Metalcore", owner: "Jose Monteiro", itemCount: 45, thumbnailUrl: "/demo/modern-metalcore.jpg", source: "spotify" },
  { id: "sp-melo", title: "Melodic Death Metal", owner: "Jose Monteiro", itemCount: 52, thumbnailUrl: "/demo/melodic-death-metal.jpg", source: "spotify" },
  { id: "sp-djent", title: "Djent Essentials", owner: "Jose Monteiro", itemCount: 38, thumbnailUrl: "/demo/djent-essentials.jpg", source: "spotify" },
  { id: "sp-sludge", title: "Sludge & Post-Metal", owner: "Jose Monteiro", itemCount: 27, thumbnailUrl: "/demo/sludge-and-post-metal.jpg", source: "spotify" },
]

const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`

/** A real metal/hard-rock queue so the player has something to actually play. */
export const demoQueue: QueueVideo[] = [
  { videoId: "v_XhxONGEJc", title: "Polaris - NIGHTMARE [Official Music Video]", channelTitle: "PolarisAus", durationLabel: "4:02", thumbnailUrl: ytThumb("v_XhxONGEJc") },
  { videoId: "CSvFpBOe8eY", title: "System Of A Down - Chop Suey!", channelTitle: "SystemOfADownVEVO", durationLabel: "3:07", thumbnailUrl: ytThumb("CSvFpBOe8eY") },
  { videoId: "W3q8Od5qJio", title: "Rammstein - Du Hast", channelTitle: "Rammstein Official", durationLabel: "3:54", thumbnailUrl: ytThumb("W3q8Od5qJio") },
  { videoId: "09LTT0xwdfw", title: "Disturbed - Down With The Sickness", channelTitle: "DisturbedTV", durationLabel: "4:39", thumbnailUrl: ytThumb("09LTT0xwdfw") },
  { videoId: "1w7OgIMMRc4", title: "Guns N' Roses - Sweet Child O' Mine", channelTitle: "GunsNRosesVEVO", durationLabel: "5:56", thumbnailUrl: ytThumb("1w7OgIMMRc4") },
]

/** Tracks of the "Classic Prog Metal" list, for the create flow. */
export const demoTracks: Track[] = [
  { id: "d1", title: "Schism", artists: "Tool", primaryArtist: "Tool", durationMs: 407_000, durationLabel: "6:47" },
  { id: "d2", title: "The Grudge", artists: "Tool", primaryArtist: "Tool", durationMs: 512_000, durationLabel: "8:32" },
  { id: "d3", title: "Blackwater Park", artists: "Opeth", primaryArtist: "Opeth", durationMs: 723_000, durationLabel: "12:03" },
  { id: "d4", title: "Pull Me Under", artists: "Dream Theater", primaryArtist: "Dream Theater", durationMs: 494_000, durationLabel: "8:14" },
  { id: "d5", title: "Oblivion", artists: "Mastodon", primaryArtist: "Mastodon", durationMs: 328_000, durationLabel: "5:28" },
  { id: "d6", title: "Bleed", artists: "Meshuggah", primaryArtist: "Meshuggah", durationMs: 424_000, durationLabel: "7:04" },
]

function candidate(over: Partial<VideoCandidate> & Pick<VideoCandidate, "videoId" | "title" | "channelTitle">): VideoCandidate {
  return { durationSec: 300, durationLabel: "5:00", viewCountLabel: "4.2M views", thumbnailUrl: ytThumb(over.videoId), ...over }
}

// Pre-built matches, keyed by track title. One track (Meshuggah - Bleed) is left
// with no candidates so the "no match / paste a link" path is demoable.
// Real video ids (so the thumbnails resolve) under descriptive titles. Playback
// is simulated in demo, so the id only needs to load its thumbnail.
const DEMO_MATCHES: Record<string, VideoCandidate[]> = {
  Schism: [candidate({ videoId: "v_XhxONGEJc", title: "TOOL - Schism (Official Video)", channelTitle: "TOOLVEVO", durationLabel: "6:47", durationSec: 407, viewCountLabel: "120M views" })],
  "The Grudge": [candidate({ videoId: "CSvFpBOe8eY", title: "TOOL - The Grudge (Audio)", channelTitle: "TOOLVEVO", durationLabel: "8:36", durationSec: 516, viewCountLabel: "9.3M views" })],
  "Blackwater Park": [candidate({ videoId: "W3q8Od5qJio", title: "Opeth - Blackwater Park (Official Audio)", channelTitle: "Opeth", durationLabel: "12:08", durationSec: 728, viewCountLabel: "6.1M views" })],
  "Pull Me Under": [candidate({ videoId: "09LTT0xwdfw", title: "Dream Theater - Pull Me Under (Official Music Video)", channelTitle: "DreamTheaterVEVO", durationLabel: "8:11", durationSec: 491, viewCountLabel: "18M views" })],
  Oblivion: [candidate({ videoId: "1w7OgIMMRc4", title: "Mastodon - Oblivion [Official Music Video]", channelTitle: "MastodonMusic", durationLabel: "5:47", durationSec: 347, viewCountLabel: "12M views" })],
  Bleed: [],
}

/** A single track's demo mapping (used in place of the real matcher). */
export function demoMatch(track: Track): Mapping {
  const candidates = DEMO_MATCHES[track.title] ?? []
  return {
    track,
    candidates,
    chosenIndex: 0,
    confidence: candidates.length ? "strong" : "review",
  }
}

/** A stand-in candidate for a pasted link in demo mode. */
export function demoVideo(videoId: string): VideoCandidate {
  return candidate({
    videoId,
    title: "Pasted video",
    channelTitle: "YouTube",
    durationLabel: "4:12",
    durationSec: 252,
    viewCountLabel: "820K views",
  })
}
