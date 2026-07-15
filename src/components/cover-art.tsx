import { cn } from "@/lib/utils"
import { coverGradient, monogram } from "@/lib/cover"

/**
 * A grayscale cover tile: real album art / video thumbnail when we have a URL,
 * otherwise a seeded gradient with a faint monogram. The grayscale treatment is
 * kept for both so the whole app reads as one system. `children` layers overlays
 * (hover play buttons, badges, tags) on top.
 */
export function CoverArt({
  seed,
  src,
  alt,
  label,
  monogramClassName,
  className,
  children,
}: {
  seed: string
  src?: string
  alt?: string
  /** Override the derived monogram text. */
  label?: string
  monogramClassName?: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-[var(--border-subtle)] grayscale",
        className
      )}
      style={src ? undefined : { background: coverGradient(seed) }}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "font-heading absolute inset-0 flex items-center justify-center text-[oklch(1_0_0/0.14)]",
            monogramClassName
          )}
        >
          {label ?? monogram(seed)}
        </div>
      )}
      {children}
    </div>
  )
}
