import { describe, expect, it } from "vitest"

import type { Track, VideoCandidate } from "@/domain/types"
import { confidenceFor, scoreCandidate, titleSimilarity } from "@/domain/matching/score"

function track(overrides: Partial<Track> = {}): Track {
  return {
    id: "t1",
    title: "Blank Space",
    artists: "Taylor Swift",
    primaryArtist: "Taylor Swift",
    durationMs: 231_000,
    durationLabel: "3:51",
    ...overrides,
  }
}

function candidate(overrides: Partial<VideoCandidate> = {}): VideoCandidate {
  return {
    videoId: "v1",
    title: "Taylor Swift - Blank Space",
    channelTitle: "TaylorSwiftVEVO",
    durationSec: 231,
    durationLabel: "3:51",
    ...overrides,
  }
}

describe("titleSimilarity", () => {
  it("is 1 when every track token appears in the candidate title", () => {
    expect(titleSimilarity(track(), candidate())).toBe(1)
  })

  it("is 0 when the candidate title shares no tokens", () => {
    expect(titleSimilarity(track(), candidate({ title: "Something Entirely Else" }))).toBe(0)
  })

  it("is 0 for an empty track title", () => {
    expect(titleSimilarity(track({ title: "" }), candidate())).toBe(0)
  })

  it("ignores parenthetical/bracketed decorations", () => {
    const t = track({ title: "Blank Space (Deluxe Edition)" })
    expect(titleSimilarity(t, candidate({ title: "Blank Space [Official]" }))).toBe(1)
  })
})

describe("scoreCandidate", () => {
  it("ranks the official canonical upload above a cover of the same song", () => {
    const canonical = candidate()
    const cover = candidate({
      videoId: "v2",
      title: "Blank Space (Cover)",
      channelTitle: "Some Fan",
    })
    expect(scoreCandidate(track(), canonical)).toBeGreaterThan(
      scoreCandidate(track(), cover)
    )
  })

  it("rewards an official channel over an unrelated uploader", () => {
    const official = candidate({ channelTitle: "TaylorSwiftVEVO" })
    const random = candidate({ channelTitle: "randomuploads123" })
    expect(scoreCandidate(track(), official)).toBeGreaterThan(
      scoreCandidate(track(), random)
    )
  })

  it("rewards closer duration matches", () => {
    const tight = candidate({ durationSec: 231 })
    const loose = candidate({ durationSec: 260 })
    expect(scoreCandidate(track(), tight)).toBeGreaterThan(
      scoreCandidate(track(), loose)
    )
  })

  it("demotes non-canonical variants (live/acoustic/remix) not implied by the track", () => {
    const studio = candidate()
    const live = candidate({ videoId: "v3", title: "Taylor Swift - Blank Space (Live)" })
    expect(scoreCandidate(track(), studio)).toBeGreaterThan(scoreCandidate(track(), live))
  })

  it("keeps a variant keyword that the track itself implies", () => {
    // The track is a live recording, so "live" in the candidate is not a penalty.
    const liveTrack = track({ title: "Blank Space (Live)" })
    const liveCandidate = candidate({ title: "Taylor Swift - Blank Space (Live)" })
    const studioCandidate = candidate({ title: "Taylor Swift - Blank Space" })
    expect(scoreCandidate(liveTrack, liveCandidate)).toBeGreaterThanOrEqual(
      scoreCandidate(liveTrack, studioCandidate)
    )
  })
})

describe("scoreCandidate prefers the official music video", () => {
  it("beats a '- Topic' remaster of the same length (All Out of Love)", () => {
    const t = track({ title: "All Out of Love", primaryArtist: "Air Supply", durationMs: 243_000 })
    const hd = candidate({
      title: "Air Supply - All Out Of Love (Official HD Video)",
      channelTitle: "AirSupplyVEVO",
      durationSec: 233,
    })
    const topic = candidate({
      title: "All Out Of Love (Digitally Remastered 1999)",
      channelTitle: "Air Supply - Topic",
      durationSec: 242,
    })
    expect(scoreCandidate(t, hd)).toBeGreaterThan(scoreCandidate(t, topic))
  })

  it("beats a random uploader's album-length cut (Shout)", () => {
    const t = track({ title: "Shout", primaryArtist: "Tears For Fears", durationMs: 394_000 })
    const official = candidate({
      title: "Tears For Fears - Shout (Official Music Video)",
      channelTitle: "TearsForFearsVEVO",
      durationSec: 360,
    })
    const random = candidate({
      title: "Shout - Tears For Fears",
      channelTitle: "maumau1968",
      durationSec: 392,
    })
    expect(scoreCandidate(t, official)).toBeGreaterThan(scoreCandidate(t, random))
  })

  it("beats the official audio upload (Time After Time)", () => {
    const t = track({ title: "Time After Time", primaryArtist: "Cyndi Lauper", durationMs: 241_000 })
    const hd = candidate({
      title: "Cyndi Lauper - Time After Time (Official HD Video)",
      channelTitle: "CyndiLauperVEVO",
      durationSec: 297,
    })
    const audio = candidate({
      title: "Cyndi Lauper - Time After Time (Audio)",
      channelTitle: "CyndiLauperVEVO",
      durationSec: 243,
    })
    expect(scoreCandidate(t, hd)).toBeGreaterThan(scoreCandidate(t, audio))
  })

  it("beats a Top of the Pops performance (Total Eclipse of the Heart)", () => {
    const t = track({
      title: "Total Eclipse of the Heart",
      primaryArtist: "Bonnie Tyler",
      durationMs: 267_000,
    })
    const video = candidate({
      title: "Bonnie Tyler - Total Eclipse of the Heart (Turn Around) (Official Video)",
      channelTitle: "bonnietylerVEVO",
      durationSec: 334,
    })
    const totp = candidate({
      title: "Bonnie Tyler - Total Eclipse of the Heart [Top Of The Pops 1984]",
      channelTitle: "bonnietylerVEVO",
      durationSec: 268,
    })
    expect(scoreCandidate(t, video)).toBeGreaterThan(scoreCandidate(t, totp))
  })
})

describe("confidenceFor", () => {
  it("is strong for an official, duration-accurate, on-title, clean match", () => {
    expect(confidenceFor(track(), candidate())).toBe("strong")
  })

  it("is review when the channel is not an official source", () => {
    expect(confidenceFor(track(), candidate({ channelTitle: "randomuploads123" }))).toBe(
      "review"
    )
  })

  it("is review when the duration is off by more than a few seconds", () => {
    expect(confidenceFor(track(), candidate({ durationSec: 200 }))).toBe("review")
  })

  it("is review for a cover even from a matching-looking channel", () => {
    expect(
      confidenceFor(track(), candidate({ title: "Blank Space (Karaoke Version)" }))
    ).toBe("review")
  })

  it("uses word boundaries so an artist substring does not count as official", () => {
    // Everything else lines up (duration, title, clean), so the only reason this
    // is "review" is that primaryArtist "Sia" must NOT match "Asiatic Sounds".
    const sia = track({
      title: "Chandelier",
      primaryArtist: "Sia",
      artists: "Sia",
      durationMs: 216_000,
    })
    const notOfficial = candidate({
      title: "Sia - Chandelier",
      channelTitle: "Asiatic Sounds",
      durationSec: 216,
    })
    expect(confidenceFor(sia, notOfficial)).toBe("review")
    // Sanity: an actual official channel for the same track is strong.
    const official = candidate({
      title: "Sia - Chandelier",
      channelTitle: "SiaVEVO",
      durationSec: 216,
    })
    expect(confidenceFor(sia, official)).toBe("strong")
  })
})
