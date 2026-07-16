/**
 * Pure queue-navigation math for the player. An empty `order` means "no shuffle"
 * (walk the queue linearly); a non-empty `order` is the shuffled playback order.
 */

/** Step by `dir` (wrapping), following the shuffle order when one is set. */
export function stepIndex(
  index: number,
  dir: 1 | -1,
  queueLength: number,
  order: number[]
): number {
  if (order.length) {
    const pos = order.indexOf(index)
    return order[(pos + dir + order.length) % order.length]
  }
  return queueLength ? (index + dir + queueLength) % queueLength : 0
}

/** The next index when a track ends: advance, stopping at the end unless repeat. */
export function advanceIndex(
  index: number,
  queueLength: number,
  order: number[],
  repeat: boolean
): number {
  if (order.length) {
    const pos = order.indexOf(index)
    if (pos < order.length - 1) return order[pos + 1]
    return repeat ? order[0] : index
  }
  if (index < queueLength - 1) return index + 1
  return repeat ? 0 : index
}

/** A shuffle order that keeps `current` first and Fisher-Yates shuffles the rest. */
export function buildShuffleOrder(
  length: number,
  current: number,
  rng: () => number = Math.random
): number[] {
  const rest: number[] = []
  for (let i = 0; i < length; i++) if (i !== current) rest.push(i)
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  return [current, ...rest]
}
