import { useCallback, useEffect, useRef, useState } from "react"

export interface AutoHideChrome {
  chromeVisible: boolean
  showChrome: () => void
  hideChrome: () => void
}

/**
 * Player chrome that reveals on pointer movement and fades itself out after a
 * quiet beat. Starts visible; `hideChrome` is for pointer-leave.
 */
export function useAutoHideChrome(delayMs = 2600): AutoHideChrome {
  const [chromeVisible, setChromeVisible] = useState(true)
  const hideTimer = useRef<number | null>(null)

  const showChrome = useCallback(() => {
    setChromeVisible(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setChromeVisible(false), delayMs)
  }, [delayMs])

  const hideChrome = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    setChromeVisible(false)
  }, [])

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    },
    []
  )

  return { chromeVisible, showChrome, hideChrome }
}
