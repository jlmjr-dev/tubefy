import { ListMusic } from "lucide-react"

import { CoverArt } from "@/shared/components/cover-art"
import type { QueueVideo } from "@/domain/types"

function EqualizerBars() {
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-[2px] bg-[oklch(0.62_0.21_277/0.45)] pb-[7px]">
      {[0, 0.2, 0.4].map((delay, i) => (
        <span
          key={i}
          className="h-[14px] w-[3px] origin-bottom bg-[oklch(0.98_0_0)]"
          style={{ animation: `eq 0.8s ${delay}s ease-in-out infinite` }}
        />
      ))}
    </div>
  )
}

/**
 * The up-next drawer pinned to the right edge. Collapsed it shows a vertical
 * tab; hovering slides it open. The now-playing row shows animated equalizer
 * bars; others show their index. Clicking a row jumps to it.
 */
export function QueueDrawer({
  queue,
  playingIndex,
  onPick,
}: {
  queue: QueueVideo[]
  playingIndex: number
  onPick: (index: number) => void
}) {
  return (
    <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-[6] flex">
      <div className="border-border pointer-events-auto flex h-full w-[clamp(300px,26vw,362px)] translate-x-[calc(100%-46px)] border-l bg-[oklch(0.13_0.006_107/0.95)] backdrop-blur-[16px] transition-transform duration-[420ms] ease-[cubic-bezier(.4,0,.2,1)] hover:translate-x-0">
        <div className="text-fg-muted flex w-[46px] flex-none flex-col items-center justify-center gap-3.5 border-r border-[var(--border-subtle)]">
          <ListMusic className="size-[18px]" />
          <span className="text-[10px] font-semibold tracking-[0.24em] uppercase [writing-mode:vertical-rl]">
            Up next · {queue.length}
          </span>
        </div>
        <div className="flex-1 overflow-auto px-3.5 py-[18px]">
          <div className="text-fg-faint mb-3.5 text-[10px] font-semibold tracking-[0.3em] uppercase">
            Queue
          </div>
          <div className="flex flex-col gap-0.5">
            {queue.map((video, i) => {
              const active = i === playingIndex
              return (
                <button
                  key={`${video.videoId}-${i}`}
                  type="button"
                  onClick={() => onPick(i)}
                  className="flex items-center gap-[11px] px-2 py-[9px] text-left transition-colors hover:bg-[oklch(1_0_0/0.05)]"
                >
                  <div className="relative size-[46px] flex-none">
                    <CoverArt
                      seed={video.channelTitle || video.title}
                      src={video.thumbnailUrl}
                      className="size-[46px]"
                      monogramClassName="text-[12px]"
                    />
                    {active ? (
                      <EqualizerBars />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold text-[oklch(0.85_0_0/0.4)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="truncate text-[12px]"
                      style={{ color: active ? "oklch(0.985 0.003 106)" : "var(--fg-muted)" }}
                    >
                      {video.title}
                    </div>
                    <div className="text-fg-fainter mt-0.5 truncate text-[11px]">
                      {video.channelTitle}
                    </div>
                  </div>
                  <span className="text-fg-fainter text-[11px] tabular-nums">
                    {video.durationLabel}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
