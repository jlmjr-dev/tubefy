import { useEffect, useState } from "react"

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Run an async loader on mount (and whenever `deps` change), tracking
 * loading/error/data and ignoring results from a superseded call. `reload`
 * re-runs it on demand.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: unknown[]
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    // Reset to loading immediately when deps change (e.g. reload()).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => ({ ...prev, loading: true, error: null }))
    loader()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : "Failed to load.",
          })
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { ...state, reload: () => setNonce((n) => n + 1) }
}
