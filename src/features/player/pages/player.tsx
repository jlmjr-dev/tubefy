import { useCallback, useMemo, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { useYouTubePlaylistItems } from "@/services/queries/use-youtube-playlist-items"
import { useAutoHideChrome } from "@/features/player/hooks/use-auto-hide-chrome"
import { usePlaybackQueue } from "@/features/player/hooks/use-playback-queue"
import { useVolume } from "@/features/player/hooks/use-volume"
import { useYouTubePlayer } from "@/features/player/hooks/use-youtube-player"
import { PlayerControls } from "@/features/player/components/player-controls"
import { PlayerStage } from "@/features/player/components/player-stage"
import { PlayerTopBar } from "@/features/player/components/player-top-bar"
import { QueueDrawer } from "@/features/player/components/queue-drawer"
import { StageStatus } from "@/features/player/components/stage-status"

/** Focus-mode player: YouTube video with custom chrome, queue, and auto-advance. */
export function Player() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const listId = params.get("list") ?? ""
  const stageRef = useRef<HTMLDivElement>(null)

  const queueState = useYouTubePlaylistItems(listId)
  const queue = useMemo(() => queueState.data ?? [], [queueState.data])

  const playback = usePlaybackQueue(queue, listId)
  const { index, current, settling, allUnplayable, shuffle, repeat } = playback

  const {
    containerRef,
    ready,
    playing,
    currentTime,
    duration,
    toggle,
    seekTo,
    setVolume,
  } = useYouTubePlayer({
    videoId: current?.videoId,
    onEnded: playback.onEnded,
    onError: playback.onError,
    onPlay: playback.onPlay,
  })

  const { volume, changeVolume, toggleMute } = useVolume(setVolume)
  const { chromeVisible, showChrome, hideChrome } = useAutoHideChrome()

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
      <PlayerStage
        containerRef={containerRef}
        ready={ready}
        playing={playing}
        settling={settling}
        allUnplayable={allUnplayable}
        current={current}
        onToggle={toggle}
      />

      <PlayerTopBar
        index={index}
        total={queue.length}
        onBack={() => navigate("/watch")}
        style={chromeStyle}
      />

      <div
        className="absolute right-0 bottom-0 left-0 bg-[linear-gradient(transparent,oklch(0.075_0.004_107/0.94))] px-[clamp(20px,4vw,54px)] pt-[clamp(18px,2.6vw,30px)] pb-[clamp(28px,4vw,42px)] transition-opacity duration-[350ms]"
        style={chromeStyle}
      >
        <PlayerControls
          transport={{
            current,
            currentTime,
            duration,
            playing,
            onToggle: toggle,
            onPrev: playback.goPrev,
            onNext: playback.goNext,
            onSeek: seekTo,
          }}
          options={{
            volume,
            repeat,
            shuffle,
            onVolumeChange: changeVolume,
            onToggleMute: toggleMute,
            onToggleRepeat: playback.toggleRepeat,
            onToggleShuffle: playback.toggleShuffle,
            onMaximize: maximize,
          }}
        />
      </div>

      {queue.length > 0 ? (
        <QueueDrawer queue={queue} playingIndex={index} onPick={playback.select} />
      ) : null}

      <StageStatus
        isPending={queueState.isPending}
        error={queueState.error}
        onRetry={() => queueState.refetch()}
        isEmpty={queue.length === 0}
      />
    </div>
  )
}
