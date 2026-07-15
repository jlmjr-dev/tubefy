import { useCallback, useEffect, useRef, useState } from "react"

import { loadYouTubeIframeApi } from "@/lib/youtube/iframe"
import type { YTPlayer } from "@/types/youtube-iframe"

interface UseYouTubePlayer {
  containerRef: React.RefObject<HTMLDivElement | null>
  ready: boolean
  playing: boolean
  currentTime: number
  duration: number
  load: (videoId: string) => void
  toggle: () => void
  seekTo: (seconds: number) => void
  setVolume: (volume: number) => void
}

/**
 * Wraps a single YT.Player instance behind custom controls: hidden native UI,
 * play/pause/seek/volume methods, polled progress, and an `onEnded` callback for
 * auto-advancing a queue. Keeps one player for its lifetime (swap videos via
 * `load`) and tears it down on unmount.
 */
export function useYouTubePlayer({ onEnded }: { onEnded?: () => void }): UseYouTubePlayer {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const intervalRef = useRef<number | null>(null)
  const onEndedRef = useRef(onEnded)
  useEffect(() => {
    onEndedRef.current = onEnded
  }, [onEnded])

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

  useEffect(() => {
    let cancelled = false
    loadYouTubeIframeApi().then((YT) => {
      if (cancelled || !containerRef.current) return
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
            if (!cancelled) setReady(true)
          },
          onStateChange: (event) => {
            const state = window.YT!.PlayerState
            if (event.data === state.PLAYING) {
              setPlaying(true)
              startPolling()
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
  }, [startPolling, stopPolling])

  const load = useCallback((videoId: string) => {
    playerRef.current?.loadVideoById(videoId)
    setCurrentTime(0)
    setDuration(0)
  }, [])

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

  return { containerRef, ready, playing, currentTime, duration, load, toggle, seekTo, setVolume }
}
