import { Play, Sparkles } from "lucide-react"

/** Indigo square play button revealed on hover over a playlist cover. */
export function PlayBadge({ size = 44, iconSize = 18 }: { size?: number; iconSize?: number }) {
  return (
    <div
      className="bg-indigo flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Play
        className="translate-x-px text-[oklch(0.98_0_0)]"
        style={{ width: iconSize, height: iconSize }}
        fill="currentColor"
        strokeWidth={0}
      />
    </div>
  )
}

/** Green "Convert" pill (Home's Spotify tiles). */
export function ConvertPill() {
  return (
    <div className="bg-spotify text-spotify-on inline-flex items-center gap-[7px] px-3 py-2 text-[10px] font-semibold tracking-[0.16em] uppercase">
      Convert
    </div>
  )
}

/** Green "Build videos" pill (Create pick tiles). */
export function BuildPill() {
  return (
    <div className="bg-spotify text-spotify-on inline-flex items-center gap-2 px-4 py-[11px] text-[10px] font-semibold tracking-[0.16em] uppercase">
      <Sparkles className="size-[14px]" strokeWidth={2.2} />
      Build videos
    </div>
  )
}
