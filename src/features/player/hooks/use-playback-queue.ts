import { useCallback, useRef, useState } from "react"

import type { QueueVideo } from "@/domain/types"
import { advanceIndex, buildShuffleOrder, stepIndex } from "@/features/player/playback"

export interface PlaybackQueue {
  index: number
  current: QueueVideo | undefined
  shuffle: boolean
  repeat: boolean
  /** True only once every video in the queue has failed to embed. */
  allUnplayable: boolean
  goNext: () => void
  goPrev: () => void
  select: (index: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
  /** Player callbacks: natural end, unplayable-video skip, successful play. */
  onEnded: () => void
  onError: () => void
  onPlay: () => void
}

/**
 * Owns which track is playing: index, shuffle order, repeat, wrap-around
 * stepping, auto-advance, and skipping past videos that refuse to embed. Resets
 * when the playlist changes. Pure navigation math lives in `./playback`.
 */
export function usePlaybackQueue(queue: QueueVideo[], listId: string): PlaybackQueue {
  const [index, setIndex] = useState(0)
  const [trackedList, setTrackedList] = useState(listId)
  const [repeat, setRepeat] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [order, setOrder] = useState<number[]>([])
  const [allUnplayable, setAllUnplayable] = useState(false)
  const skipCount = useRef(0)

  const goNext = useCallback(
    () => setIndex((i) => stepIndex(i, 1, queue.length, order)),
    [queue.length, order]
  )
  const goPrev = useCallback(
    () => setIndex((i) => stepIndex(i, -1, queue.length, order)),
    [queue.length, order]
  )

  const onEnded = useCallback(
    () => setIndex((i) => advanceIndex(i, queue.length, order, repeat)),
    [queue.length, order, repeat]
  )

  const toggleShuffle = useCallback(() => {
    if (shuffle) {
      setShuffle(false)
      setOrder([])
      return
    }
    // Keep the current track first, shuffle the rest.
    setShuffle(true)
    setOrder(buildShuffleOrder(queue.length, index))
  }, [shuffle, queue.length, index])

  const toggleRepeat = useCallback(() => setRepeat((r) => !r), [])

  // Many official music videos block embedding; skip past unplayable ones, and
  // only give up once the entire queue has failed without anything playing.
  const onError = useCallback(() => {
    skipCount.current += 1
    if (queue.length > 0 && skipCount.current >= queue.length) {
      setAllUnplayable(true)
      return
    }
    setIndex((i) => (queue.length ? (i + 1) % queue.length : 0))
  }, [queue.length])

  // A successful play means the queue isn't all-broken; reset the skip counter.
  const onPlay = useCallback(() => {
    skipCount.current = 0
    setAllUnplayable(false)
  }, [])

  // Reset position + shuffle when the playlist changes (render-phase reset).
  if (listId !== trackedList) {
    setTrackedList(listId)
    setIndex(0)
    setShuffle(false)
    setOrder([])
  }

  return {
    index,
    current: queue[index],
    shuffle,
    repeat,
    allUnplayable,
    goNext,
    goPrev,
    select: setIndex,
    toggleShuffle,
    toggleRepeat,
    onEnded,
    onError,
    onPlay,
  }
}
