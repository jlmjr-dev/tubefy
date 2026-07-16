import { useCallback, useRef, useState } from "react"

export interface Volume {
  volume: number
  changeVolume: (value: number) => void
  toggleMute: () => void
}

/**
 * Volume state mirrored to the player, with mute/unmute that remembers the last
 * non-zero level. `applyVolume` pushes the value to the underlying player.
 */
export function useVolume(applyVolume: (value: number) => void, initial = 100): Volume {
  const [volume, setVolume] = useState(initial)
  const lastVolume = useRef(initial)

  const changeVolume = useCallback(
    (value: number) => {
      setVolume(value)
      applyVolume(value)
      if (value > 0) lastVolume.current = value
    },
    [applyVolume]
  )

  const toggleMute = useCallback(() => {
    const next = volume > 0 ? 0 : lastVolume.current || 100
    setVolume(next)
    applyVolume(next)
  }, [volume, applyVolume])

  return { volume, changeVolume, toggleMute }
}
