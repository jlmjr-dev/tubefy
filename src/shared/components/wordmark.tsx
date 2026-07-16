import { cn } from "@/shared/lib/utils"

/**
 * The Tubefy wordmark. `hero` is the giant centered login treatment; `bar` is
 * the compact lockup used in screen top bars. Text only, no glyph.
 */
export function Wordmark({
  variant = "bar",
  className,
}: {
  variant?: "hero" | "bar"
  className?: string
}) {
  if (variant === "hero") {
    return (
      <div
        className={cn(
          "font-heading pl-[0.34em] text-[clamp(36px,6.5vw,68px)] leading-none font-semibold tracking-[0.34em] uppercase",
          className
        )}
      >
        Tubefy
      </div>
    )
  }

  return (
    <span
      className={cn(
        "font-heading text-[15px] tracking-[0.2em] uppercase",
        className
      )}
    >
      Tubefy
    </span>
  )
}
