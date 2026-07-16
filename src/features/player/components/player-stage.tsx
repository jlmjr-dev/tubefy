import type { RefObject } from "react"
import { ExternalLink, Play, VideoOff } from "lucide-react"

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
function PausedScrim() {
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

/** Opaque notice shown while skipping past a video that can't be embedded, so
 * the viewer never sees YouTube's raw error flash by. */
function SkipNotice() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center bg-stage">
      <div className="flex flex-col items-center gap-3">
        <span className="size-5 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-[var(--fg-fainter)] border-t-transparent" />
        <div className="text-fg-muted text-[11px] font-semibold tracking-[0.2em] uppercase">
          Skipping a video that can&rsquo;t play here
        </div>
      </div>
    </div>
  )
}

/** Opaque, readable end state when nothing in the queue can be embedded. */
function UnplayableNotice({ videoId }: { videoId?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-stage px-6 text-center">
      <div className="flex max-w-[440px] flex-col items-center gap-4">
        <VideoOff className="text-fg-fainter size-8" />
        <div>
          <div className="font-heading text-[clamp(18px,2.4vw,26px)] tracking-[0.04em] uppercase">
            Can&rsquo;t play these here
          </div>
          <p className="text-fg-faint mt-2 text-[12px] leading-[1.55]">
            Their owners disabled embedding, so these videos only play on YouTube.
          </p>
        </div>
        {videoId ? (
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noreferrer"
            className="bg-indigo text-indigo-on inline-flex h-11 items-center gap-2 px-5 text-[11px] font-semibold tracking-[0.18em] uppercase transition-[filter] hover:brightness-110"
          >
            Watch on YouTube
            <ExternalLink className="size-[15px]" />
          </a>
        ) : null}
      </div>
    </div>
  )
}

/** Picks the one stage overlay that applies, most urgent first. */
function StageOverlay({
  ready,
  playing,
  settling,
  allUnplayable,
  current,
}: {
  ready: boolean
  playing: boolean
  settling: boolean
  allUnplayable: boolean
  current?: QueueVideo
}) {
  if (allUnplayable) return <UnplayableNotice videoId={current?.videoId} />
  if (settling) return <SkipNotice />
  if (!ready) return <LoadingTitle title={current?.title} />
  if (!playing) return <PausedScrim />
  return null
}

/** The 16:9 video stage: the YouTube mount, a click-to-toggle overlay, and the
 * pre-ready / paused / skipping / unplayable overlays that hide the embed's UI. */
export function PlayerStage({
  containerRef,
  ready,
  playing,
  settling,
  allUnplayable,
  current,
  onToggle,
}: {
  containerRef: RefObject<HTMLDivElement | null>
  ready: boolean
  playing: boolean
  settling: boolean
  allUnplayable: boolean
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
      <StageOverlay
        ready={ready}
        playing={playing}
        settling={settling}
        allUnplayable={allUnplayable}
        current={current}
      />
    </div>
  )
}
