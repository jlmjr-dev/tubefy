/**
 * Minimal typings for the Google Identity Services OAuth2 token model
 * (https://accounts.google.com/gsi/client) — just the surface Tubefy uses.
 */
export interface TokenResponse {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  error?: string
  error_description?: string
}

export interface TokenClientConfig {
  client_id: string
  scope: string
  callback: (response: TokenResponse) => void
  error_callback?: (error: { type?: string; message?: string }) => void
  prompt?: "" | "none" | "consent" | "select_account"
}

export interface TokenClient {
  callback: (response: TokenResponse) => void
  error_callback?: (error: { type?: string; message?: string }) => void
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient
          revoke: (token: string, done?: () => void) => void
        }
      }
    }
  }
}
