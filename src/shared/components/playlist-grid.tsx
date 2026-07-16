import { cn } from "@/shared/lib/utils"

/** The subset of a TanStack Query result the grid needs to render its states. */
export interface GridState<T> {
  data: T[] | undefined
  isPending: boolean
  error: Error | null
}

/**
 * Renders a responsive grid of playlist tiles for a queried list, handling the
 * loading (skeleton), error, and empty states so screens don't repeat them.
 */
export function PlaylistGrid<T>({
  state,
  columnMin,
  aspectClassName,
  gapClassName = "gap-[clamp(14px,1.6vw,22px)]",
  skeletonCount = 6,
  emptyLabel = "Nothing here yet.",
  onReload,
  children,
}: {
  state: GridState<T>
  columnMin: string
  aspectClassName: string
  gapClassName?: string
  skeletonCount?: number
  emptyLabel?: string
  onReload?: () => void
  children: (items: T[]) => React.ReactNode
}) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fill, minmax(${columnMin}, 1fr))`,
  }

  if (state.isPending) {
    return (
      <div style={gridStyle} className={gapClassName}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div
            key={i}
            className={cn("bg-panel/60 animate-[softpulse_1.6s_ease-in-out_infinite]", aspectClassName)}
          />
        ))}
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="text-fg-faint flex items-center gap-4 py-6 text-[13px]">
        <span>{state.error.message}</span>
        {onReload ? (
          <button
            type="button"
            onClick={onReload}
            className="text-indigo-text text-[11px] font-semibold tracking-[0.16em] uppercase"
          >
            Retry
          </button>
        ) : null}
      </div>
    )
  }

  if (!state.data || state.data.length === 0) {
    return <div className="text-fg-faint py-6 text-[13px]">{emptyLabel}</div>
  }

  return (
    <div style={gridStyle} className={gapClassName}>
      {children(state.data)}
    </div>
  )
}
