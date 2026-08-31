import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  isFullscreen,
  subscribeFullscreen,
  toggleFullscreen,
} from "@/features/player/fullscreen"

const requestFullscreen = vi.fn(() => Promise.resolve())
const exitFullscreen = vi.fn(() => Promise.resolve())

let stage: HTMLDivElement

/** Stand in for the browser having put `element` (or nothing) on the screen. */
function setFullscreenElement(element: Element | null) {
  Object.defineProperty(document, "fullscreenElement", {
    configurable: true,
    value: element,
  })
}

beforeEach(() => {
  stage = document.createElement("div")
  stage.requestFullscreen = requestFullscreen
  document.exitFullscreen = exitFullscreen
  setFullscreenElement(null)
})

afterEach(() => {
  requestFullscreen.mockClear()
  exitFullscreen.mockClear()
  Reflect.deleteProperty(document, "fullscreenElement")
  Reflect.deleteProperty(document, "exitFullscreen")
})

describe("isFullscreen", () => {
  it("is true only for the element the document is showing", () => {
    setFullscreenElement(stage)
    expect(isFullscreen(stage)).toBe(true)
    expect(isFullscreen(document.createElement("div"))).toBe(false)
  })

  it("is false when nothing is fullscreen, and for a missing element", () => {
    setFullscreenElement(null)
    expect(isFullscreen(stage)).toBe(false)
    expect(isFullscreen(null)).toBe(false)
  })
})

describe("toggleFullscreen", () => {
  it("requests fullscreen for the stage when nothing is fullscreen", () => {
    toggleFullscreen(stage)
    expect(requestFullscreen).toHaveBeenCalledTimes(1)
    expect(exitFullscreen).not.toHaveBeenCalled()
  })

  it("exits on the document when the stage is already fullscreen", () => {
    // The regression: the second click used to request fullscreen again, which
    // the browser treats as a no-op, so fullscreen could be entered but never
    // left. Exiting is only available on the document, never on the element.
    setFullscreenElement(stage)
    toggleFullscreen(stage)
    expect(exitFullscreen).toHaveBeenCalledTimes(1)
    expect(requestFullscreen).not.toHaveBeenCalled()
  })

  it("enters and then leaves across two clicks", () => {
    toggleFullscreen(stage)
    setFullscreenElement(stage) // the browser grants the request
    toggleFullscreen(stage)
    expect(requestFullscreen).toHaveBeenCalledTimes(1)
    expect(exitFullscreen).toHaveBeenCalledTimes(1)
  })

  it("takes the screen over when some other element holds it", () => {
    setFullscreenElement(document.createElement("div"))
    toggleFullscreen(stage)
    expect(requestFullscreen).toHaveBeenCalledTimes(1)
    expect(exitFullscreen).not.toHaveBeenCalled()
  })

  it("does nothing when there is no stage yet", () => {
    toggleFullscreen(null)
    expect(requestFullscreen).not.toHaveBeenCalled()
    expect(exitFullscreen).not.toHaveBeenCalled()
  })
})

describe("subscribeFullscreen", () => {
  it("follows exits the button did not ask for, such as Escape", () => {
    const seen: boolean[] = []
    const stop = subscribeFullscreen(() => seen.push(isFullscreen(stage)))

    setFullscreenElement(stage)
    document.dispatchEvent(new Event("fullscreenchange"))
    // Escape leaves fullscreen without going through our toggle at all.
    setFullscreenElement(null)
    document.dispatchEvent(new Event("fullscreenchange"))

    expect(seen).toEqual([true, false])
    stop()
  })

  it("stops listening once unsubscribed", () => {
    const onChange = vi.fn()
    subscribeFullscreen(onChange)()
    document.dispatchEvent(new Event("fullscreenchange"))
    expect(onChange).not.toHaveBeenCalled()
  })
})
