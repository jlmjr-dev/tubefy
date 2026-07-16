import { useCallback, useEffect, useRef, useState } from "react"

import { loadYouTubeIframeApi } from "@/services/youtube/iframe"
import type { YTPlayer } from "@/types/youtube-iframe"

interface UseYouTubePlayer {
  containerRef: React.RefObject<HTMLDivElement | null>
  ready: boolean
  playing: boolean
  currentTime: number
  duration: number
  toggle: () => void
  seekTo: (seconds: number) => void
  setVolume: (volume: number) => void
}

/**
 * Wraps a single YT.Player instance behind custom controls: hidden native UI,
 * play/pause/seek/volume methods, polled progress, and onEnded/onError/onPlay
 * callbacks. The player is created only once we have a `videoId`, and that first
 * video is loaded *synchronously inside onReady* — loading it later (e.g. from a
 * separate effect) makes YouTube treat it as a programmatic play and block
 * autoplay. Subsequent track changes load fine once something is already
 * playing. Keeps one player for its lifetime and tears it down on unmount.
 */
export function useYouTubePlayer({
  videoId,
  onEnded,
  onError,
  onPlay,
}: {
  videoId?: string
  onEnded?: () => void
  onError?: (code: number) => void
  onPlay?: () => void
}): UseYouTubePlayer {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const intervalRef = useRef<number | null>(null)
  const videoIdRef = useRef(videoId)
  const loadedRef = useRef<string | undefined>(undefined)
  const onEndedRef = useRef(onEnded)
  const onErrorRef = useRef(onError)
  const onPlayRef = useRef(onPlay)
  useEffect(() => {
    videoIdRef.current = videoId
    onEndedRef.current = onEnded
    onErrorRef.current = onError
    onPlayRef.current = onPlay
  }, [videoId, onEnded, onError, onPlay])

  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const stopPolling = useCallback(() => {
    if (intervalRef.current != null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startPolling = useCallback(() => {
    if (intervalRef.current != null) return
    intervalRef.current = window.setInterval(() => {
      const player = playerRef.current
      if (!player) return
      setCurrentTime(player.getCurrentTime() || 0)
      const total = player.getDuration() || 0
      if (total) setDuration(total)
    }, 250)
  }, [])

  // Create the player once we have a video. `hasVideo` flips false->true a single
  // time (when the queue loads) and then stays true as the videoId changes, so
  // this effect runs creation exactly once and only tears down on unmount.
  const hasVideo = Boolean(videoId)
  useEffect(() => {
    if (!hasVideo) return
    let cancelled = false
    loadYouTubeIframeApi().then((YT) => {
      if (cancelled || !containerRef.current || playerRef.current) return
      playerRef.current = new YT.Player(containerRef.current, {
        width: "100%",
        height: "100%",
        playerVars: {
          controls: 0,
          disablekb: 1,
          rel: 0,
          iv_load_policy: 3,
          playsinline: 1,
          fs: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (cancelled) return
            setReady(true)
            // Load the first video here (synchronously) so autoplay is allowed.
            const id = videoIdRef.current
            if (id) {
              playerRef.current?.loadVideoById(id)
              loadedRef.current = id
            }
          },
          onStateChange: (event) => {
            const state = window.YT!.PlayerState
            if (event.data === state.PLAYING) {
              setPlaying(true)
              startPolling()
              onPlayRef.current?.()
              const total = playerRef.current?.getDuration() || 0
              if (total) setDuration(total)
            } else if (event.data === state.PAUSED) {
              setPlaying(false)
              stopPolling()
            } else if (event.data === state.ENDED) {
              setPlaying(false)
              stopPolling()
              onEndedRef.current?.()
            }
          },
          onError: (event) => {
            // Codes 2, 5, 100, 101, 150 — unplayable / not embeddable.
            setPlaying(false)
            stopPolling()
            onErrorRef.current?.(event.data)
          },
        },
      })
    })
    return () => {
      cancelled = true
      stopPolling()
      const player = playerRef.current
      playerRef.current = null
      if (player?.destroy) {
        try {
          player.destroy()
        } catch {
          // player already gone
        }
      }
    }
  }, [hasVideo, startPolling, stopPolling])

  // Swap to a new video when the queue advances. Safe to do from an effect here
  // because something is already playing by this point (not the initial load).
  useEffect(() => {
    if (ready && videoId && loadedRef.current !== videoId) {
      playerRef.current?.loadVideoById(videoId)
      loadedRef.current = videoId
      setCurrentTime(0)
      setDuration(0)
    }
  }, [ready, videoId])

  const toggle = useCallback(() => {
    const player = playerRef.current
    if (!player) return
    if (player.getPlayerState() === window.YT?.PlayerState.PLAYING) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }, [])

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true)
    setCurrentTime(seconds)
  }, [])

  const setVolume = useCallback((volume: number) => {
    playerRef.current?.setVolume(volume)
  }, [])

  return { containerRef, ready, playing, currentTime, duration, toggle, seekTo, setVolume }
}
