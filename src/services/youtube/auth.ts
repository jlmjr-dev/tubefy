import { config } from "@/shared/lib/config"
import { clearTokens, isExpired, loadTokens, saveTokens } from "@/shared/lib/storage"
import type { TokenClient, TokenResponse } from "@/types/google-gsi"

/**
 * YouTube auth via the Google Identity Services "token model". This is the
 * current browser-only OAuth path (the old gapi.auth2 is retired): there is NO
 * refresh token — access tokens last ~1h and are renewed by asking GIS again,
 * silently (`prompt: ""`) once the user has consented.
 */

const GSI_SRC = "https://accounts.google.com/gsi/client"
const TOKEN_KEY = "tubefy.youtube.token"

let gsiPromise: Promise<void> | null = null

/** Load the GIS client script once; safe to call eagerly at app start. */
export function loadGsi(): Promise<void> {
  if (gsiPromise) return gsiPromise
  gsiPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve()
    const existing = document.getElementById("gsi-client")
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("GIS load failed")))
      return
    }
    const script = document.createElement("script")
    script.id = "gsi-client"
    script.src = GSI_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Google Identity Services."))
    document.head.appendChild(script)
  })
  return gsiPromise
}

let tokenClient: TokenClient | null = null

async function getClient(): Promise<TokenClient> {
  await loadGsi()
  if (!window.google) throw new Error("Google Identity Services unavailable.")
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: config.google.clientId,
      scope: config.google.scopes.join(" "),
      callback: () => {},
    })
  }
  return tokenClient
}

// The GIS token client is a shared singleton whose callback is reassigned per
// request, so two concurrent requests would clobber each other's callback and
// leave one promise hanging forever. Serialize them behind one in-flight promise.
let pendingToken: Promise<TokenResponse> | null = null

function requestToken(prompt: "" | "consent"): Promise<TokenResponse> {
  if (pendingToken) return pendingToken
  pendingToken = new Promise<TokenResponse>((resolve, reject) => {
    getClient()
      .then((client) => {
        client.callback = (response) => {
          if (response.error) reject(new Error(response.error))
          else resolve(response)
        }
        client.error_callback = (err) =>
          reject(new Error(err.message || err.type || "YouTube authorization failed."))
        client.requestAccessToken({ prompt })
      })
      .catch(reject)
  }).finally(() => {
    pendingToken = null
  })
  return pendingToken
}

/** Interactive connect: prompts the account picker / consent the first time. */
export async function connectYouTube(): Promise<void> {
  const response = await requestToken("")
  saveTokens(TOKEN_KEY, {
    accessToken: response.access_token,
    expiresAt: Date.now() + response.expires_in * 1000,
  })
}

/** Return a valid access token, renewing silently when it has expired. */
export async function getYouTubeToken(): Promise<string> {
  const tokens = loadTokens(TOKEN_KEY)
  if (tokens && !isExpired(tokens)) return tokens.accessToken
  const response = await requestToken("")
  const next = {
    accessToken: response.access_token,
    expiresAt: Date.now() + response.expires_in * 1000,
  }
  saveTokens(TOKEN_KEY, next)
  return next.accessToken
}

export function isYouTubeConnected(): boolean {
  // Optimistic, like Spotify's refresh-token check: a stored token is renewable
  // via a silent GIS request, so treat its presence (not its freshness) as
  // connected. getYouTubeToken() drives the actual renew / disconnect-on-failure.
  return loadTokens(TOKEN_KEY) !== null
}

export function disconnectYouTube(): void {
  const tokens = loadTokens(TOKEN_KEY)
  if (tokens && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(tokens.accessToken)
  }
  clearTokens(TOKEN_KEY)
}
