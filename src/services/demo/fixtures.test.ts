import { describe, expect, it } from "vitest"

import {
  demoMatch,
  demoQueue,
  demoSpotifyPlaylists,
  demoTracks,
  demoVideo,
  demoYouTubePlaylists,
} from "@/services/demo/fixtures"

describe("demo fixtures", () => {
  it("has metal playlists on both shelves with covers", () => {
    expect(demoYouTubePlaylists.length).toBeGreaterThan(0)
    expect(demoSpotifyPlaylists.length).toBeGreaterThan(0)
    for (const p of [...demoYouTubePlaylists, ...demoSpotifyPlaylists]) {
      expect(p.thumbnailUrl).toMatch(/^\/demo\/.+\.jpg$/)
    }
  })

  it("gives every queue video an id so the player can load it", () => {
    expect(demoQueue.length).toBeGreaterThan(0)
    for (const v of demoQueue) expect(v.videoId).toMatch(/^[\w-]{11}$/)
  })

  it("matches most tracks but leaves one unmatched to demo the paste flow", () => {
    const mappings = demoTracks.map(demoMatch)
    const noMatch = mappings.filter((m) => m.candidates.length === 0)
    expect(noMatch).toHaveLength(1)
    expect(noMatch[0].confidence).toBe("review")
    const matched = mappings.filter((m) => m.candidates.length > 0)
    expect(matched.length).toBeGreaterThan(0)
    for (const m of matched) expect(m.confidence).toBe("strong")
  })

  it("turns a pasted id into a candidate", () => {
    const c = demoVideo("dQw4w9WgXcQ")
    expect(c.videoId).toBe("dQw4w9WgXcQ")
    expect(c.durationLabel).toBeTruthy()
  })
})
