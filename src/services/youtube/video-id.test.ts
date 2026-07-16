import { describe, expect, it } from "vitest"

import { parseYouTubeVideoId } from "@/services/youtube/video-id"

describe("parseYouTubeVideoId", () => {
  it("reads a standard watch URL", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    )
  })

  it("ignores extra query params (list, timestamp)", () => {
    expect(
      parseYouTubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RD&t=42s")
    ).toBe("dQw4w9WgXcQ")
  })

  it("reads a youtu.be short link", () => {
    expect(parseYouTubeVideoId("https://youtu.be/dQw4w9WgXcQ?si=abc")).toBe("dQw4w9WgXcQ")
  })

  it("reads embed, shorts, and music/mobile hosts", () => {
    expect(parseYouTubeVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    )
    expect(parseYouTubeVideoId("https://youtube.com/shorts/dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    )
    expect(parseYouTubeVideoId("https://music.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "dQw4w9WgXcQ"
    )
  })

  it("accepts a bare video id", () => {
    expect(parseYouTubeVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ")
    expect(parseYouTubeVideoId("  dQw4w9WgXcQ  ")).toBe("dQw4w9WgXcQ")
  })

  it("rejects non-YouTube or malformed input", () => {
    expect(parseYouTubeVideoId("https://vimeo.com/12345")).toBeNull()
    expect(parseYouTubeVideoId("not a url")).toBeNull()
    expect(parseYouTubeVideoId("https://www.youtube.com/watch?v=tooshort")).toBeNull()
    expect(parseYouTubeVideoId("")).toBeNull()
  })
})
