import {
  Maximize,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react"

import { CoverArt } from "@/components/cover-art"
import { formatSeconds } from "@/lib/format"
import type { QueueVideo } from "@/lib/types"

function GhostButton({
  onClick,
  label,
  children,
}: {
  onClick?: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex cursor-pointer p-[5px] text-inherit transition-colors hover:text-[oklch(0.98_0_0)]"
    >
      {children}
    </button>
  )
}

/** The bottom chrome: scrubber row plus the transport + now-playing + options row. */
export function PlayerControls({
  current,
  currentTime,
  duration,
  playing,
  muted,
  onToggle,
  onPrev,
  onNext,
  onSeek,
  onToggleMute,
  onMaximize,
}: {
  current?: QueueVideo
  currentTime: number
  duration: number
  playing: boolean
  muted: boolean
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (seconds: number) => void
  onToggleMute: () => void
  onMaximize: () => void
}) {
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  const handleScrub = (event: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    onSeek(fraction * duration)
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-[13px]">
        <span className="text-fg-muted text-[11px] font-semibold tracking-[0.06em] tabular-nums">
          {formatSeconds(currentTime)}
        </span>
        <div
          className="relative h-[3px] flex-1 cursor-pointer bg-[oklch(1_0_0/0.16)]"
          onClick={handleScrub}
        >
          <div
            className="bg-indigo absolute inset-y-0 left-0"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 size-[11px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[oklch(0.72_0.16_277)]"
            style={{ left: `${progress}%` }}
          />
        </div>
        <span className="text-fg-muted text-[11px] font-semibold tracking-[0.06em] tabular-nums">
          {duration > 0 ? formatSeconds(duration) : (current?.durationLabel ?? "0:00")}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-[clamp(10px,1.6vw,20px)]">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous"
            className="flex cursor-pointer p-1.5 text-[oklch(0.85_0.01_107)] transition-colors hover:text-[oklch(0.98_0_0)]"
          >
            <SkipBack className="size-5" fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            aria-label={playing ? "Pause" : "Play"}
            className="bg-indigo flex size-[52px] cursor-pointer items-center justify-center text-[oklch(0.98_0_0)] transition-[filter,transform] hover:brightness-110 active:translate-y-px"
          >
            {playing ? (
              <Pause className="size-[22px]" fill="currentColor" strokeWidth={0} />
            ) : (
              <Play className="size-[22px] translate-x-px" fill="currentColor" strokeWidth={0} />
            )}
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next"
            className="flex cursor-pointer p-1.5 text-[oklch(0.85_0.01_107)] transition-colors hover:text-[oklch(0.98_0_0)]"
          >
            <SkipForward className="size-5" fill="currentColor" />
          </button>
          <div className="ml-2.5 flex min-w-0 items-center gap-3">
            <CoverArt
              seed={current?.channelTitle || current?.title || "Tubefy"}
              src={current?.thumbnailUrl}
              className="size-11 flex-none"
            />
            <div className="min-w-0">
              <div className="max-w-[38vw] truncate text-[12px] font-semibold tracking-[0.04em]">
                {current?.title ?? ""}
              </div>
              <div className="text-fg-faint mt-0.5 truncate text-[11px]">
                {current?.channelTitle ?? ""}
              </div>
            </div>
          </div>
        </div>

        <div className="text-fg-muted flex items-center gap-[clamp(8px,1.4vw,16px)]">
          <GhostButton label="Shuffle">
            <Shuffle className="size-[17px]" />
          </GhostButton>
          <GhostButton label="Repeat">
            <Repeat className="size-[17px]" />
          </GhostButton>
          <GhostButton label={muted ? "Unmute" : "Mute"} onClick={onToggleMute}>
            {muted ? <VolumeX className="size-[17px]" /> : <Volume2 className="size-[17px]" />}
          </GhostButton>
          <GhostButton label="Fullscreen" onClick={onMaximize}>
            <Maximize className="size-[17px]" />
          </GhostButton>
        </div>
      </div>
    </>
  )
}
