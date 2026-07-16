import { describe, expect, it } from "vitest"

import {
  formatMs,
  formatSeconds,
  formatViewCount,
  parseIsoDuration,
} from "@/lib/format"

describe("formatMs", () => {
  it("formats whole minutes and seconds", () => {
    expect(formatMs(231_000)).toBe("3:51")
  })

  it("zero-pads the seconds and rounds to the nearest second", () => {
    expect(formatMs(65_000)).toBe("1:05")
    expect(formatMs(59_900)).toBe("1:00")
  })

  it("handles zero", () => {
    expect(formatMs(0)).toBe("0:00")
  })
})

describe("formatSeconds", () => {
  it("formats m:ss under an hour", () => {
    expect(formatSeconds(242)).toBe("4:02")
    expect(formatSeconds(90)).toBe("1:30")
  })

  it("formats h:mm:ss at or above an hour", () => {
    expect(formatSeconds(3661)).toBe("1:01:01")
  })

  it("clamps negatives to zero", () => {
    expect(formatSeconds(-5)).toBe("0:00")
  })
})

describe("parseIsoDuration", () => {
  it("parses minutes and seconds", () => {
    expect(parseIsoDuration("PT4M13S")).toBe(253)
  })

  it("parses hours, minutes, seconds", () => {
    expect(parseIsoDuration("PT1H2M3S")).toBe(3723)
  })

  it("parses days", () => {
    expect(parseIsoDuration("P1DT2H")).toBe(93_600)
  })

  it("returns 0 for unparseable input", () => {
    expect(parseIsoDuration("not-a-duration")).toBe(0)
  })
})

describe("formatViewCount", () => {
  it("formats plain counts under a thousand", () => {
    expect(formatViewCount(500)).toBe("500 views")
  })

  it("formats thousands", () => {
    expect(formatViewCount(1200)).toBe("1K views")
  })

  it("promotes 999.5K up to 1M at the rounding boundary", () => {
    expect(formatViewCount(999_500)).toBe("1M views")
  })

  it("formats millions, trimming a trailing .0", () => {
    expect(formatViewCount(5_000_000)).toBe("5M views")
    expect(formatViewCount(12_340_000)).toBe("12.3M views")
  })

  it("promotes 999.95M up to 1B at the rounding boundary", () => {
    expect(formatViewCount(999_950_000)).toBe("1B views")
  })

  it("formats billions", () => {
    expect(formatViewCount(1_500_000_000)).toBe("1.5B views")
  })

  it("returns an empty string for invalid counts", () => {
    expect(formatViewCount(-5)).toBe("")
    expect(formatViewCount(Number.NaN)).toBe("")
  })
})
