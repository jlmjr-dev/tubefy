import { CoverArt } from "@/components/cover-art"
import { cn } from "@/lib/utils"

/**
 * A clickable playlist tile: cover, title, and a meta line, with an optional
 * top-left badge and a hover overlay (play button / convert pill). Shared by
 * Home, Watch, and Create.
 */
export function PlaylistCard({
  seed,
  thumbnailUrl,
  title,
  meta,
  onClick,
  aspectClassName = "aspect-square",
  monogramClassName = "text-[46px]",
  liftClassName = "hover:-translate-y-[5px]",
  titleClassName = "text-[12px] tracking-[0.07em]",
  topLeft,
  overlay,
  animationDelay = "0s",
}: {
  seed: string
  thumbnailUrl?: string
  title: string
  meta?: string
  onClick: () => void
  aspectClassName?: string
  monogramClassName?: string
  liftClassName?: string
  titleClassName?: string
  topLeft?: React.ReactNode
  overlay?: React.ReactNode
  animationDelay?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group/card block cursor-pointer text-left transition-transform duration-200",
        liftClassName
      )}
      style={{ animation: `fadeUp 0.5s ${animationDelay} both` }}
    >
      <CoverArt
        seed={seed}
        src={thumbnailUrl}
        className={aspectClassName}
        monogramClassName={monogramClassName}
      >
        {topLeft ? <div className="absolute top-3 left-3">{topLeft}</div> : null}
        {overlay ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(oklch(0.145_0.006_107/0),oklch(0.145_0.006_107/0.55))] opacity-0 transition-opacity duration-200 group-hover/card:opacity-100">
            {overlay}
          </div>
        ) : null}
      </CoverArt>
      <div className={cn("mt-[11px] truncate font-semibold uppercase", titleClassName)}>
        {title}
      </div>
      {meta ? (
        <div className="text-fg-faint mt-1 truncate text-[12px]">{meta}</div>
      ) : null}
    </button>
  )
}
