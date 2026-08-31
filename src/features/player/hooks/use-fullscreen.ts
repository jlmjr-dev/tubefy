import { useCallback, useEffect, useState } from "react"

import {
  isFullscreen,
  subscribeFullscreen,
  toggleFullscreen,
} from "@/features/player/fullscreen"

export interface Fullscreen {
  fullscreen: boolean
  toggleFullscreen: () => void
}

/**
 * Whether `target` is currently filling the screen, plus the toggle for the
 * fullscreen button. The flag is read back from the document on every
 * `fullscreenchange`, so Escape and the browser's own exit keep the button's
 * icon and label right just as clicking it does.
 */
export function useFullscreen(target: React.RefObject<Element | null>): Fullscreen {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(
    () => subscribeFullscreen(() => setFullscreen(isFullscreen(target.current))),
    [target]
  )

  const toggle = useCallback(() => toggleFullscreen(target.current), [target])

  return { fullscreen, toggleFullscreen: toggle }
}
