import { describe, expect, it } from "vitest"

import { advanceIndex, buildShuffleOrder, stepIndex } from "@/features/player/playback"

describe("stepIndex", () => {
  it("walks the queue linearly and wraps around", () => {
    expect(stepIndex(0, 1, 3, [])).toBe(1)
    expect(stepIndex(2, 1, 3, [])).toBe(0)
    expect(stepIndex(0, -1, 3, [])).toBe(2)
  })

  it("follows the shuffle order when one is set", () => {
    const order = [2, 0, 1]
    expect(stepIndex(2, 1, 3, order)).toBe(0)
    expect(stepIndex(1, 1, 3, order)).toBe(2) // wraps to the front of the order
    expect(stepIndex(0, -1, 3, order)).toBe(2)
  })

  it("returns 0 for an empty queue", () => {
    expect(stepIndex(0, 1, 0, [])).toBe(0)
  })
})

describe("advanceIndex", () => {
  it("advances then stops at the end when repeat is off", () => {
    expect(advanceIndex(0, 3, [], false)).toBe(1)
    expect(advanceIndex(2, 3, [], false)).toBe(2) // stays put at the end
  })

  it("loops to the start at the end when repeat is on", () => {
    expect(advanceIndex(2, 3, [], true)).toBe(0)
  })

  it("advances through and stops at the end of a shuffle order", () => {
    const order = [1, 2, 0]
    expect(advanceIndex(1, 3, order, false)).toBe(2)
    expect(advanceIndex(0, 3, order, false)).toBe(0) // 0 is last in the order
    expect(advanceIndex(0, 3, order, true)).toBe(1) // repeat loops to order[0]
  })
})

describe("buildShuffleOrder", () => {
  it("keeps the current track first and includes every index once", () => {
    const order = buildShuffleOrder(4, 2)
    expect(order[0]).toBe(2)
    expect([...order].sort((a, b) => a - b)).toEqual([0, 1, 2, 3])
  })

  it("is deterministic given a fixed rng", () => {
    const rng = () => 0 // always picks the lowest swap index
    expect(buildShuffleOrder(4, 0, rng)).toEqual(buildShuffleOrder(4, 0, rng))
  })
})
