/**
 * Runtime configuration, read from Vite env vars. Tubefy is a pure frontend SPA,
 * so the only secrets are OAuth *client ids* (public by design) — there are no
 * client secrets. See SETUP.md for how to obtain these.
 */

const origin = typeof window !== "undefined" ? window.location.origin : ""

export const config = {
  spotify: {
    clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? "",
    // Spotify no longer allows `localhost`; the app + redirect both use 127.0.0.1.
    redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI ?? `${origin}/callback`,
    scopes: [
      "playlist-read-private",
      "playlist-read-collaborative",
      "user-read-email",
    ],
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "",
    // The broad `youtube` scope covers both browsing and creating playlists.
    scopes: ["https://www.googleapis.com/auth/youtube"],
  },
  // YouTube's search bucket allows ~100 search calls/day and Tubefy does one
  // search per track, so a single conversion is capped to stay well within it.
  maxTracksPerConversion: Number(import.meta.env.VITE_MAX_TRACKS ?? 50),
} as const

export const isSpotifyConfigured = () => Boolean(config.spotify.clientId)
export const isGoogleConfigured = () => Boolean(config.google.clientId)
