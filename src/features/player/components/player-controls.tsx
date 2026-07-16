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

import { CoverArt } from "@/shared/components/cover-art"
import { Scrubber } from "@/features/player/components/scrubber"
import type { QueueVideo } from "@/domain/types"

export interface TransportControls {
  current?: QueueVideo
  currentTime: number
  duration: number
  playing: boolean
  onToggle: () => void
  onPrev: () => void
  onNext: () => void
  onSeek: (seconds: number) => void
}

export interface OptionControls {
  volume: number
  repeat: boolean
  shuffle: boolean
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
  onToggleRepeat: () => void
  onToggleShuffle: () => void
  onMaximize: () => void
}

function GhostButton({
  onClick,
  label,
  active,
  children,
}: {
  onClick?: () => void
  label: string
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="flex cursor-pointer p-[5px] text-inherit transition-colors hover:text-[oklch(0.98_0_0)]"
    >
      {children}
    </button>
  )
}

/** Mute toggle plus a volume slider that reveals on hover. */
function VolumeControl({
  volume,
  onVolumeChange,
  onToggleMute,
}: {
  volume: number
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
}) {
  return (
    <div className="group/vol flex items-center gap-1.5">
      <GhostButton label={volume === 0 ? "Unmute" : "Mute"} onClick={onToggleMute}>
        {volume === 0 ? (
          <VolumeX className="size-[17px]" />
        ) : (
          <Volume2 className="size-[17px]" />
        )}
      </GhostButton>
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        aria-label="Volume"
        className="h-1 w-0 cursor-pointer opacity-0 transition-[width,opacity] duration-200 group-hover/vol:w-[68px] group-hover/vol:opacity-100"
        style={{ accentColor: "var(--indigo)" }}
      />
    </div>
  )
}

/** Previous / play-pause / next plus the now-playing artwork and title. */
function Transport({ current, playing, onToggle, onPrev, onNext }: TransportControls) {
  return (
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
  )
}

/** Shuffle / repeat / volume / fullscreen. */
function Options({
  volume,
  repeat,
  shuffle,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onMaximize,
}: OptionControls) {
  return (
    <div className="text-fg-muted flex items-center gap-[clamp(8px,1.4vw,16px)]">
      <GhostButton
        label={shuffle ? "Shuffle on" : "Shuffle"}
        active={shuffle}
        onClick={onToggleShuffle}
      >
        <Shuffle
          className="size-[17px]"
          style={{ color: shuffle ? "var(--indigo-text)" : undefined }}
        />
      </GhostButton>
      <GhostButton
        label={repeat ? "Repeat on" : "Repeat"}
        active={repeat}
        onClick={onToggleRepeat}
      >
        <Repeat
          className="size-[17px]"
          style={{ color: repeat ? "var(--indigo-text)" : undefined }}
        />
      </GhostButton>
      <VolumeControl
        volume={volume}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
      />
      <GhostButton label="Fullscreen" onClick={onMaximize}>
        <Maximize className="size-[17px]" />
      </GhostButton>
    </div>
  )
}

/** The bottom chrome: scrubber row plus the transport + now-playing + options row. */
export function PlayerControls({
  transport,
  options,
}: {
  transport: TransportControls
  options: OptionControls
}) {
  return (
    <>
      <Scrubber
        currentTime={transport.currentTime}
        duration={transport.duration}
        current={transport.current}
        onSeek={transport.onSeek}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Transport {...transport} />
        <Options {...options} />
      </div>
    </>
  )
}
