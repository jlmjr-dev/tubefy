/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import { isGoogleConfigured, isSpotifyConfigured } from "@/shared/lib/config"
import type { Platform, PlatformProfile } from "@/domain/types"
import {
  beginSpotifyLogin,
  completeSpotifyLogin as exchangeSpotifyCode,
  disconnectSpotify,
  fetchSpotifyProfile,
  isSpotifyConnected,
} from "@/services/spotify/auth"
import {
  connectYouTube as authorizeYouTube,
  disconnectYouTube,
  fetchYouTubeProfile,
  isYouTubeConnected,
  loadGsi,
} from "@/services/youtube/auth"

export interface PlatformAuth {
  connected: boolean
  loading: boolean
  profile?: PlatformProfile
  error?: string
}

interface AuthContextValue {
  spotify: PlatformAuth
  youtube: PlatformAuth
  bothConnected: boolean
  connectSpotify: () => Promise<void>
  connectYouTube: () => Promise<void>
  completeSpotifyLogin: () => Promise<void>
  disconnect: (platform: Platform) => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

const CONFIG_HINT: Record<Platform, string> = {
  spotify: "Add your Spotify client id to .env.local (see SETUP.md).",
  youtube: "Add your Google client id to .env.local (see SETUP.md).",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [spotify, setSpotify] = React.useState<PlatformAuth>({
    connected: isSpotifyConnected(),
    loading: false,
  })
  const [youtube, setYoutube] = React.useState<PlatformAuth>({
    connected: isYouTubeConnected(),
    loading: false,
  })

  // Warm up the Google client so the popup opens promptly on the connect click.
  React.useEffect(() => {
    if (isGoogleConfigured()) void loadGsi().catch(() => {})
  }, [])

  // Backfill profiles for platforms that are already connected on load.
  React.useEffect(() => {
    if (spotify.connected && !spotify.profile) {
      fetchSpotifyProfile()
        .then((profile) => setSpotify((s) => ({ ...s, profile })))
        .catch(() => setSpotify({ connected: false, loading: false }))
    }
    if (youtube.connected && !youtube.profile) {
      fetchYouTubeProfile()
        .then((profile) => setYoutube((s) => ({ ...s, profile })))
        .catch(() => setYoutube({ connected: false, loading: false }))
    }
    // Run once on mount; connect handlers keep state fresh thereafter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connectSpotify = React.useCallback(async () => {
    if (!isSpotifyConfigured()) {
      setSpotify((s) => ({ ...s, error: CONFIG_HINT.spotify }))
      return
    }
    setSpotify((s) => ({ ...s, loading: true, error: undefined }))
    try {
      await beginSpotifyLogin() // navigates away to Spotify
    } catch (err) {
      setSpotify((s) => ({ ...s, loading: false, error: messageOf(err) }))
    }
  }, [])

  const connectYouTube = React.useCallback(async () => {
    if (!isGoogleConfigured()) {
      setYoutube((s) => ({ ...s, error: CONFIG_HINT.youtube }))
      return
    }
    setYoutube((s) => ({ ...s, loading: true, error: undefined }))
    try {
      await authorizeYouTube()
      const profile = await fetchYouTubeProfile()
      setYoutube({ connected: true, loading: false, profile })
    } catch (err) {
      setYoutube({ connected: false, loading: false, error: messageOf(err) })
    }
  }, [])

  const completeSpotifyLogin = React.useCallback(async () => {
    setSpotify((s) => ({ ...s, loading: true, error: undefined }))
    try {
      await exchangeSpotifyCode()
      const profile = await fetchSpotifyProfile()
      setSpotify({ connected: true, loading: false, profile })
    } catch (err) {
      setSpotify({ connected: false, loading: false, error: messageOf(err) })
      throw err
    }
  }, [])

  const disconnect = React.useCallback((platform: Platform) => {
    if (platform === "spotify") {
      disconnectSpotify()
      setSpotify({ connected: false, loading: false })
    } else {
      disconnectYouTube()
      setYoutube({ connected: false, loading: false })
    }
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      spotify,
      youtube,
      bothConnected: spotify.connected && youtube.connected,
      connectSpotify,
      connectYouTube,
      completeSpotifyLogin,
      disconnect,
    }),
    [spotify, youtube, connectSpotify, connectYouTube, completeSpotifyLogin, disconnect]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function messageOf(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong."
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
