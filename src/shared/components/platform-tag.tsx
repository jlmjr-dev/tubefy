import { cn } from "@/shared/lib/utils"
import type { Platform } from "@/domain/types"

export type { Platform }

const META: Record<Platform, { color: string; label: string }> = {
  spotify: { color: "var(--spotify)", label: "Spotify" },
  youtube: { color: "var(--youtube)", label: "YouTube" },
}

/**
 * Spotify / YouTube marker: a brand-colored square dot plus a label. `chip` is
 * the bordered pill used in top bars; `inline` is the bare dot + label used in
 * section headers. Brand colors appear only here and on the login cards.
 */
export function PlatformTag({
  platform,
  variant = "inline",
  label,
  className,
}: {
  platform: Platform
  variant?: "chip" | "inline"
  label?: string
  className?: string
}) {
  const meta = META[platform]
  const text = label ?? meta.label

  if (variant === "chip") {
    return (
      <div
        className={cn(
          "border-border flex items-center gap-[7px] border px-[11px] py-[6px]",
          className
        )}
      >
        <span className="size-[7px]" style={{ background: meta.color }} />
        <span className="text-fg-muted text-[10px] font-semibold tracking-[0.16em] uppercase">
          {text}
        </span>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-[6px]", className)}>
      <span className="size-[7px]" style={{ background: meta.color }} />
      <span className="text-fg-faint text-[10px] font-semibold tracking-[0.16em] uppercase">
        {text}
      </span>
    </div>
  )
}
