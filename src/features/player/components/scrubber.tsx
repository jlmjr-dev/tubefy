import { formatSeconds } from "@/shared/lib/format"
import type { QueueVideo } from "@/domain/types"

/** The seek bar: elapsed / total labels around a click-to-seek progress track. */
export function Scrubber({
  currentTime,
  duration,
  current,
  onSeek,
}: {
  currentTime: number
  duration: number
  current?: QueueVideo
  onSeek: (seconds: number) => void
}) {
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  const handleScrub = (event: React.MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    onSeek(fraction * duration)
  }

  return (
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
  )
}
