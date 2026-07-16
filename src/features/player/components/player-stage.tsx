import type { RefObject } from "react"
import { Play } from "lucide-react"

import type { QueueVideo } from "@/domain/types"

/** The title shown faintly over the stage before the video is ready to play. */
function LoadingTitle({ title }: { title?: string }) {
  if (!title) return null
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-5 text-center">
      <div className="font-heading text-[clamp(22px,3vw,40px)] tracking-[0.05em] text-[oklch(1_0_0/0.2)] uppercase">
        {title}
      </div>
    </div>
  )
}

/**
 * Covers YouTube's paused UI (its play button, title, share, and "More videos"
 * cards, none of which the embed lets us remove) with a clean scrim + our own
 * solid-white play glyph.
 */
function PausedScrim({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center bg-[oklch(0.06_0.004_107/0.68)]">
      <Play
        className="size-20 text-white drop-shadow-[0_1px_6px_oklch(0_0_0/0.45)]"
        fill="currentColor"
        strokeWidth={0}
      />
    </div>
  )
}

/** The 16:9 video stage: the YouTube mount, a click-to-toggle overlay, and the
 * pre-ready title / paused scrim that hide the embed's own chrome. */
export function PlayerStage({
  containerRef,
  ready,
  playing,
  current,
  onToggle,
}: {
  containerRef: RefObject<HTMLDivElement | null>
  ready: boolean
  playing: boolean
  current?: QueueVideo
  onToggle: () => void
}) {
  return (
    <div className="relative aspect-video w-[min(92vw,calc((100vh_-_40px)_*_1.777))] border border-[var(--border-subtle)] bg-black">
      <div ref={containerRef} className="size-full" />
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={onToggle}
        className="absolute inset-0 cursor-pointer"
      />
      <div className="pointer-events-none absolute top-4 left-[18px] text-[9px] font-semibold tracking-[0.28em] text-[oklch(0.85_0_0/0.55)] uppercase">
        {"▶"} YouTube
      </div>
      <LoadingTitle title={!ready ? current?.title : undefined} />
      <PausedScrim show={ready && !playing} />
    </div>
  )
}
