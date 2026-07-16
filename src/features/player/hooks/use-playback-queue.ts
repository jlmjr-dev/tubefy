import { useCallback, useEffect, useRef, useState } from "react"

import type { QueueVideo } from "@/domain/types"
import {
  advanceIndex,
  buildShuffleOrder,
  nextPlayableIndex,
  stepIndex,
} from "@/features/player/playback"

export interface PlaybackQueue {
  index: number
  current: QueueVideo | undefined
  shuffle: boolean
  repeat: boolean
  /** Skipping past a video that can't be embedded, hunting for a playable one. */
  settling: boolean
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
 * stepping, auto-advance, and skipping past videos that refuse to embed. It
 * remembers which videos failed so it skips them cleanly (no flashing through
 * YouTube's own error UI) and only gives up once the whole queue has failed.
 */
export function usePlaybackQueue(queue: QueueVideo[], listId: string): PlaybackQueue {
  const [index, setIndex] = useState(0)
  const [trackedList, setTrackedList] = useState(listId)
  const [repeat, setRepeat] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [order, setOrder] = useState<number[]>([])
  const [settling, setSettling] = useState(false)
  const [allUnplayable, setAllUnplayable] = useState(false)
  const unplayable = useRef<Set<string>>(new Set())
  const indexRef = useRef(index)
  useEffect(() => {
    indexRef.current = index
  }, [index])

  // Forget which videos failed when the playlist changes.
  useEffect(() => {
    unplayable.current = new Set()
  }, [listId])

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

  // Jump to a specific track (queue drawer): give it a fresh chance to play.
  const select = useCallback((i: number) => {
    setAllUnplayable(false)
    setSettling(false)
    setIndex(i)
  }, [])

  // Remember the failed video and skip to the next one not known to be broken.
  const onError = useCallback(() => {
    const i = indexRef.current
    const failed = queue[i]?.videoId
    if (failed) unplayable.current.add(failed)
    const next = nextPlayableIndex(
      i,
      queue.map((v) => v.videoId),
      unplayable.current
    )
    if (next === -1) {
      setSettling(false)
      setAllUnplayable(true)
    } else {
      setSettling(true)
      setIndex(next)
    }
  }, [queue])

  // A successful play means we've landed on something playable.
  const onPlay = useCallback(() => {
    setSettling(false)
    setAllUnplayable(false)
  }, [])

  // Reset position + shuffle + skip memory when the playlist changes.
  if (listId !== trackedList) {
    setTrackedList(listId)
    setIndex(0)
    setShuffle(false)
    setOrder([])
    setSettling(false)
    setAllUnplayable(false)
  }

  return {
    index,
    current: queue[index],
    shuffle,
    repeat,
    settling,
    allUnplayable,
    goNext,
    goPrev,
    select,
    toggleShuffle,
    toggleRepeat,
    onEnded,
    onError,
    onPlay,
  }
}
