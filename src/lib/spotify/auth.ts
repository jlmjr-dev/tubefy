import { config } from "@/lib/config"
import {
  clearTokens,
  isExpired,
  loadTokens,
  saveTokens,
  type StoredTokens,
} from "@/lib/auth/storage"
import type { PlatformProfile } from "@/lib/auth/types"

/**
 * Spotify Authorization Code + PKCE for a pure browser SPA. No client secret is
 * involved: the code exchange and refresh both run directly from the browser
 * against Spotify's token endpoint (which allows CORS for PKCE).
 */

const TOKENS_KEY = "tubefy.spotify.tokens"
const VERIFIER_KEY = "tubefy.spotify.verifier"
const STATE_KEY = "tubefy.spotify.state"

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize"
const TOKEN_URL = "https://accounts.spotify.com/api/token"
const API = "https://api.spotify.com/v1"

const B64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"

function randomString(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  let out = ""
  for (const byte of bytes) out += B64URL_ALPHABET[byte % B64URL_ALPHABET.length]
  return out
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = ""
  for (const byte of bytes) str += String.fromCharCode(byte)
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

async function codeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  )
  return base64UrlEncode(new Uint8Array(digest))
}

/** Kick off the PKCE flow by redirecting the browser to Spotify's consent page. */
export async function beginSpotifyLogin(): Promise<void> {
  const verifier = randomString(64)
  const state = randomString(16)
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  sessionStorage.setItem(STATE_KEY, state)

  const params = new URLSearchParams({
    client_id: config.spotify.clientId,
    response_type: "code",
    redirect_uri: config.spotify.redirectUri,
    code_challenge_method: "S256",
    code_challenge: await codeChallenge(verifier),
    scope: config.spotify.scopes.join(" "),
    state,
  })
  window.location.assign(`${AUTHORIZE_URL}?${params.toString()}`)
}

/** True when the current URL carries a Spotify authorization response. */
export function hasSpotifyRedirect(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.has("code") || params.has("error")
}

/** Exchange the authorization code (from the redirect) for tokens. */
export async function completeSpotifyLogin(): Promise<void> {
  const params = new URLSearchParams(window.location.search)
  const error = params.get("error")
  if (error) throw new Error(`Spotify authorization was denied (${error}).`)

  const code = params.get("code")
  const state = params.get("state")
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  const expectedState = sessionStorage.getItem(STATE_KEY)

  if (!code || !verifier) throw new Error("Missing Spotify authorization code.")
  if (!state || state !== expectedState) throw new Error("Spotify state mismatch.")

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: config.spotify.redirectUri,
    client_id: config.spotify.clientId,
    code_verifier: verifier,
  })
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) throw new Error("Spotify token exchange failed.")

  const data = await res.json()
  saveTokens(TOKENS_KEY, {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  })
  sessionStorage.removeItem(VERIFIER_KEY)
  sessionStorage.removeItem(STATE_KEY)
}

async function refresh(tokens: StoredTokens): Promise<StoredTokens> {
  if (!tokens.refreshToken) {
    clearTokens(TOKENS_KEY)
    throw new Error("Spotify session expired. Please reconnect.")
  }
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refreshToken,
    client_id: config.spotify.clientId,
  })
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
  if (!res.ok) {
    // invalid_grant => the refresh token was revoked or has expired.
    clearTokens(TOKENS_KEY)
    throw new Error("Spotify session expired. Please reconnect.")
  }
  const data = await res.json()
  const next: StoredTokens = {
    accessToken: data.access_token,
    // Spotify may or may not rotate the refresh token.
    refreshToken: data.refresh_token ?? tokens.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  saveTokens(TOKENS_KEY, next)
  return next
}

/** Return a valid access token, refreshing transparently when needed. */
export async function getSpotifyToken(): Promise<string> {
  let tokens = loadTokens(TOKENS_KEY)
  if (!tokens) throw new Error("Not connected to Spotify.")
  if (isExpired(tokens)) tokens = await refresh(tokens)
  return tokens.accessToken
}

export function isSpotifyConnected(): boolean {
  const tokens = loadTokens(TOKENS_KEY)
  return Boolean(tokens && (tokens.refreshToken || !isExpired(tokens)))
}

export function disconnectSpotify(): void {
  clearTokens(TOKENS_KEY)
}

export async function fetchSpotifyProfile(): Promise<PlatformProfile> {
  const token = await getSpotifyToken()
  const headers = { Authorization: `Bearer ${token}` }
  const [me, playlists] = await Promise.all([
    fetch(`${API}/me`, { headers }).then((r) => r.json()),
    fetch(`${API}/me/playlists?limit=1`, { headers }).then((r) => r.json()),
  ])
  return {
    name: me.display_name || me.id || "Spotify",
    avatarUrl: me.images?.[0]?.url,
    playlistCount: playlists.total,
  }
}
