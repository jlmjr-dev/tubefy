import { useState } from "react"

import { cn } from "@/lib/utils"
import { coverGradient, monogram } from "@/lib/cover"

/**
 * A grayscale cover tile: real album art / video thumbnail when we have a URL,
 * otherwise a seeded gradient with a faint monogram. `revealOnHover` fades the
 * art to full color when an ancestor `group/card` is hovered. A failed image
 * falls back to the gradient/monogram. `children` layers overlays on top.
 */
export function CoverArt({
  seed,
  src,
  alt,
  label,
  monogramClassName,
  className,
  revealOnHover = false,
  children,
}: {
  seed: string
  src?: string
  alt?: string
  /** Override the derived monogram text. */
  label?: string
  monogramClassName?: string
  className?: string
  revealOnHover?: boolean
  children?: React.ReactNode
}) {
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-[var(--border-subtle)] grayscale",
        revealOnHover && "transition-[filter] duration-500 group-hover/card:grayscale-0",
        className
      )}
      style={showImage ? undefined : { background: coverGradient(seed) }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          // YouTube serves a 120x90 grey placeholder (with 200 OK) for missing
          // thumbnails; real ones are >=320 wide. Fall back on either.
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth <= 120) setFailedSrc(src)
          }}
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
