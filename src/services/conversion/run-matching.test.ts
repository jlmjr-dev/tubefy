import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/services/conversion/match-track", () => ({ matchTrack: vi.fn() }))

import type { Mapping, Track } from "@/domain/types"
import { matchTrack } from "@/services/conversion/match-track"
import { runMatching } from "@/services/conversion/run-matching"

const mockedMatch = vi.mocked(matchTrack)

function track(id: string): Track {
  return {
    id,
    title: `Song ${id}`,
    artists: "Artist",
    primaryArtist: "Artist",
    durationMs: 1000,
    durationLabel: "0:01",
  }
}

function mapping(t: Track): Mapping {
  return {
    track: t,
    candidates: [
      {
        videoId: `v${t.id}`,
        title: `Video ${t.id}`,
        channelTitle: "Channel",
        durationSec: 1,
        durationLabel: "0:01",
      },
    ],
    chosenIndex: 0,
    confidence: "strong",
  }
}

afterEach(() => mockedMatch.mockReset())

describe("runMatching", () => {
  it("keeps results in track order regardless of completion order", async () => {
    const tracks = [track("1"), track("2"), track("3")]
    const delays: Record<string, number> = { "1": 30, "2": 10, "3": 0 }
    mockedMatch.mockImplementation(
      (t) => new Promise((r) => setTimeout(() => r(mapping(t)), delays[t.id]))
    )
    const { mappings } = await runMatching(tracks, { concurrency: 3 })
    expect(mappings.map((m) => m.track.id)).toEqual(["1", "2", "3"])
  })

  it("captures the first error and degrades that track to an empty review mapping", async () => {
    const tracks = [track("1"), track("2")]
    mockedMatch.mockImplementation((t) =>
      t.id === "1" ? Promise.reject(new Error("quota")) : Promise.resolve(mapping(t))
    )
    const { mappings, firstError } = await runMatching(tracks, { concurrency: 1 })
    expect(firstError).toBe("quota")
    expect(mappings[0].candidates).toEqual([])
    expect(mappings[0].confidence).toBe("review")
    expect(mappings[1].candidates).toHaveLength(1)
  })

  it("streams every result through onResult", async () => {
    const tracks = [track("1"), track("2")]
    mockedMatch.mockImplementation((t) => Promise.resolve(mapping(t)))
    const seen: string[] = []
    await runMatching(tracks, { concurrency: 2, onResult: (m) => seen.push(m.track.id) })
    expect(seen.sort()).toEqual(["1", "2"])
  })

  it("never runs more workers than tracks", async () => {
    const tracks = [track("1")]
    let active = 0
    let maxActive = 0
    mockedMatch.mockImplementation((t) => {
      active += 1
      maxActive = Math.max(maxActive, active)
      return new Promise((r) =>
        setTimeout(() => {
          active -= 1
          r(mapping(t))
        }, 5)
      )
    })
    await runMatching(tracks, { concurrency: 8 })
    expect(maxActive).toBe(1)
  })
})
