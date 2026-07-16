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
 * The player stage's status layer. Renders nothing when a video is playing;
 * otherwise the matching loading / error / empty / all-unplayable message.
 */
export function StageStatus({
  isPending,
  error,
  onRetry,
  isEmpty,
  allUnplayable,
  currentVideoId,
}: {
  isPending: boolean
  error: Error | null
  onRetry: () => void
  isEmpty: boolean
  allUnplayable: boolean
  currentVideoId?: string
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

  if (allUnplayable && currentVideoId) {
    return (
      <StageMessage>
        <span>These videos can&rsquo;t be embedded here.</span>
        <a
          href={`https://www.youtube.com/watch?v=${currentVideoId}`}
          target="_blank"
          rel="noreferrer"
          className={linkClass}
        >
          Watch on YouTube
        </a>
      </StageMessage>
    )
  }

  return null
}
