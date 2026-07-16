/** Centered status overlay on the player stage (loading / error / empty). */
function StageMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <div className="text-fg-muted pointer-events-auto flex flex-col items-center text-center text-[12px] font-semibold tracking-[0.2em] uppercase">
        {children}
      </div>
    </div>
  )
}

const linkClass =
  "text-indigo-text mt-3 text-[11px] font-semibold tracking-[0.16em] uppercase"

/**
 * Queue-level status before any video is on the stage: loading the playlist, a
 * fetch error, or an empty playlist. Per-video states (paused / skipping /
 * unplayable) live in PlayerStage.
 */
export function StageStatus({
  isPending,
  error,
  onRetry,
  isEmpty,
}: {
  isPending: boolean
  error: Error | null
  onRetry: () => void
  isEmpty: boolean
}) {
  if (isPending) return <StageMessage>Loading playlist…</StageMessage>

  if (error) {
    return (
      <StageMessage>
        <span>{error.message}</span>
        <button type="button" onClick={onRetry} className={linkClass}>
          Retry
        </button>
      </StageMessage>
    )
  }

  if (isEmpty) return <StageMessage>No playable videos in this playlist.</StageMessage>

  return null
}
