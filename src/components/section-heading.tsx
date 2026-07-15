import { PlatformTag } from "@/components/platform-tag"
import type { Platform } from "@/lib/types"

/** A section title (Lora) with an optional platform tag on the right. */
export function SectionHeading({
  label,
  platform,
  animationDelay = "0s",
}: {
  label: string
  platform?: Platform
  animationDelay?: string
}) {
  return (
    <div
      className="mb-3.5 flex items-baseline justify-between gap-3"
      style={{ animation: `fadeUp 0.5s ${animationDelay} both` }}
    >
      <span className="font-heading text-[18px] tracking-[0.08em] uppercase">
        {label}
      </span>
      {platform ? <PlatformTag platform={platform} /> : null}
    </div>
  )
}
