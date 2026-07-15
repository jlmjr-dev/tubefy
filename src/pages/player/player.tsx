import { useCallback, useEffect, useRef, useState } from "react"
import { Play } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { BackButton } from "@/components/back-button"
import { useAsync } from "@/hooks/use-async"
import { useYouTubePlayer } from "@/hooks/use-youtube-player"
import { getYouTubePlaylistItems } from "@/lib/youtube/api"
import { PlayerControls } from "@/pages/player/player-controls"
import { QueueDrawer } from "@/pages/player/queue-drawer"

const CHROME_HIDE_MS = 2600

/** Focus-mode player: YouTube video with custom chrome, queue, and auto-advance. */
export function Player() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const listId = params.get("list") ?? ""

  const queueState = useAsync(() => getYouTubePlaylistItems(listId), [listId])
  const queue = queueState.data ?? []

  const [index, setIndex] = useState(0)
  const [trackedList, setTrackedList] = useState(listId)
  const [chromeVisible, setChromeVisible] = useState(true)
  const [muted, setMuted] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [allUnplayable, setAllUnplayable] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<number | null>(null)
  const skipCount = useRef(0)

  // Manual next/prev wrap around the queue.
  const goNext = useCallback(() => {
    setIndex((i) => (queue.length ? (i + 1) % queue.length : 0))
  }, [queue.length])
  const goPrev = useCallback(() => {
    setIndex((i) => (queue.length ? (i - 1 + queue.length) % queue.length : 0))
  }, [queue.length])

  // Auto-advance stops at the end of the queue unless Repeat is on.
  const handleEnded = useCallback(() => {
    setIndex((i) => {
      if (i < queue.length - 1) return i + 1
      return repeat ? 0 : i
    })
  }, [queue.length, repeat])

  // Many official music videos block embedding; skip past unplayable ones, and
  // only give up once the entire queue has failed without anything playing.
  const handleError = useCallback(() => {
    skipCount.current += 1
    if (queue.length > 0 && skipCount.current >= queue.length) {
      setAllUnplayable(true)
      return
    }
    setIndex((i) => (queue.length ? (i + 1) % queue.length : 0))
  }, [queue.length])

  // A successful play means the queue isn't all-broken; reset the skip counter.
  const handlePlay = useCallback(() => {
    skipCount.current = 0
    setAllUnplayable(false)
  }, [])

  const {
    containerRef,
    ready,
    playing,
    currentTime,
    duration,
    load,
    toggle,
    seekTo,
    setVolume,
  } = useYouTubePlayer({
    onEnded: handleEnded,
    onError: handleError,
    onPlay: handlePlay,
  })

  // Reset the queue position when the playlist changes (render-phase reset).
  if (listId !== trackedList) {
    setTrackedList(listId)
    setIndex(0)
  }

  const current = queue[index]
  const currentVideoId = current?.videoId

  useEffect(() => {
    if (ready && currentVideoId) load(currentVideoId)
  }, [ready, currentVideoId, load])

  const showChrome = useCallback(() => {
    setChromeVisible(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setChromeVisible(false), CHROME_HIDE_MS)
  }, [])
  const hideChrome = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    setChromeVisible(false)
  }, [])
  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }
  }, [])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      setVolume(m ? 100 : 0)
      return !m
    })
  }, [setVolume])

  const maximize = useCallback(() => {
    stageRef.current?.requestFullscreen?.().catch(() => {})
  }, [])

  const chromeStyle = {
    opacity: chromeVisible ? 1 : 0,
    pointerEvents: chromeVisible ? ("auto" as const) : ("none" as const),
  }

  return (
    <div
      ref={stageRef}
      onMouseMove={showChrome}
      onMouseLeave={hideChrome}
      className="bg-stage absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div className="relative aspect-video w-[min(92vw,calc((100vh_-_40px)_*_1.777))] border border-[var(--border-subtle)] bg-black">
        <div ref={containerRef} className="size-full" />
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={toggle}
          className="absolute inset-0 cursor-pointer"
        />
        <div className="pointer-events-none absolute top-4 left-[18px] text-[9px] font-semibold tracking-[0.28em] text-[oklch(0.85_0_0/0.55)] uppercase">
          {"▶"} YouTube
        </div>
        {!ready && current ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-5 text-center">
            <div className="font-heading text-[clamp(22px,3vw,40px)] tracking-[0.05em] text-[oklch(1_0_0/0.2)] uppercase">
              {current.title}
            </div>
          </div>
        ) : null}
        {ready && !playing ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="flex size-[88px] items-center justify-center bg-[oklch(0.62_0.21_277/0.94)]">
              <Play
                className="size-[34px] translate-x-[3px] text-[oklch(0.98_0_0)]"
                fill="currentColor"
                strokeWidth={0}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="absolute top-0 right-0 left-0 flex items-center justify-between gap-4 bg-[linear-gradient(oklch(0.075_0.004_107/0.85),transparent)] px-[clamp(20px,4vw,54px)] py-[clamp(16px,2.4vw,26px)] transition-opacity duration-[350ms]"
        style={chromeStyle}
      >
        <BackButton onClick={() => navigate("/watch")} label="Playlists" />
        <div className="text-fg-faint text-[9px] font-semibold tracking-[0.3em] uppercase">
          Now playing · {String(index + 1).padStart(2, "0")} /{" "}
          {String(queue.length).padStart(2, "0")}
        </div>
        <div className="text-fg-fainter text-[9px] font-semibold tracking-[0.24em] uppercase">
          Focus mode
        </div>
      </div>

      <div
        className="absolute right-0 bottom-0 left-0 bg-[linear-gradient(transparent,oklch(0.075_0.004_107/0.94))] px-[clamp(20px,4vw,54px)] pt-[clamp(18px,2.6vw,30px)] pb-[clamp(28px,4vw,42px)] transition-opacity duration-[350ms]"
        style={chromeStyle}
      >
        <PlayerControls
          current={current}
          currentTime={currentTime}
          duration={duration}
          playing={playing}
          muted={muted}
          repeat={repeat}
          onToggle={toggle}
          onPrev={goPrev}
          onNext={goNext}
          onSeek={seekTo}
          onToggleMute={toggleMute}
          onToggleRepeat={() => setRepeat((r) => !r)}
          onMaximize={maximize}
        />
      </div>

      {queue.length > 0 ? (
        <QueueDrawer queue={queue} playingIndex={index} onPick={setIndex} />
      ) : null}

      {queueState.loading ? (
        <StageMessage>Loading playlist…</StageMessage>
      ) : queueState.error ? (
        <StageMessage>
          <span>{queueState.error}</span>
          <button
            type="button"
            onClick={queueState.reload}
            className="text-indigo-text mt-3 text-[11px] font-semibold tracking-[0.16em] uppercase"
          >
            Retry
          </button>
        </StageMessage>
      ) : queue.length === 0 ? (
        <StageMessage>No playable videos in this playlist.</StageMessage>
      ) : allUnplayable && current ? (
        <StageMessage>
          <span>These videos can&rsquo;t be embedded here.</span>
          <a
            href={`https://www.youtube.com/watch?v=${current.videoId}`}
            target="_blank"
            rel="noreferrer"
            className="text-indigo-text mt-3 text-[11px] font-semibold tracking-[0.16em] uppercase"
          >
            Watch on YouTube
          </a>
        </StageMessage>
      ) : null}
    </div>
  )
}

/** Centered status overlay on the player stage (loading / error / empty). */
function StageMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="text-fg-muted pointer-events-auto flex flex-col items-center text-center text-[12px] font-semibold tracking-[0.2em] uppercase">
        {children}
      </div>
    </div>
  )
}
