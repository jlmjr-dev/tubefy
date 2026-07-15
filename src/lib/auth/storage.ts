/** Small localStorage-backed token store shared by the Spotify + YouTube auth. */

export interface StoredTokens {
  accessToken: string
  refreshToken?: string
  /** Epoch milliseconds at which the access token expires. */
  expiresAt: number
}

export function loadTokens(key: string): StoredTokens | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredTokens
    if (!parsed.accessToken || typeof parsed.expiresAt !== "number") return null
    return parsed
  } catch {
    return null
  }
}

export function saveTokens(key: string, tokens: StoredTokens): void {
  localStorage.setItem(key, JSON.stringify(tokens))
}

export function clearTokens(key: string): void {
  localStorage.removeItem(key)
}

/** True when the access token is expired (or within `skewMs` of expiring). */
export function isExpired(tokens: StoredTokens, skewMs = 60_000): boolean {
  return Date.now() >= tokens.expiresAt - skewMs
}
