/**
 * Normalize an unknown thrown value to a human-readable message. Uses the
 * Error's own message when there is one, otherwise the provided fallback.
 */
export function messageOf(err: unknown, fallback = "Something went wrong."): string {
  return err instanceof Error ? err.message : fallback
}
