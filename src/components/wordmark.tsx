import { cn } from "@/lib/utils"

/** The indigo rotated-square glyph that stands in for the Tubefy logo. */
export function Diamond({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-block rotate-45 bg-indigo", className)}
      style={style}
    />
  )
}

/**
 * The Tubefy wordmark. `hero` is the giant centered login treatment; `bar` is
 * the compact lockup (diamond + name) used in screen top bars.
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
    <div className={cn("flex items-center gap-[11px]", className)}>
      <Diamond className="size-4" />
      <span className="font-heading text-[15px] tracking-[0.2em] uppercase">
        Tubefy
      </span>
    </div>
  )
}
