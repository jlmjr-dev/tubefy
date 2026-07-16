import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { request } from "@/services/http"

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  // Make the backoff instant so retry tests do not actually wait.
  vi.stubGlobal("setTimeout", (fn: () => void) => {
    fn()
    return 0
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

describe("request", () => {
  it("returns parsed JSON on success and sends the bearer token", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: "abc" }))
    const data = await request<{ id: string }>("https://api/x", {
      label: "Spotify",
      token: "tok",
    })
    expect(data).toEqual({ id: "abc" })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers.Authorization).toBe("Bearer tok")
  })

  it("retries a 429 and then succeeds", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "slow down" }, 429))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    const data = await request<{ ok: boolean }>("https://api/x", { label: "YouTube" })
    expect(data).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("retries 5xx up to the limit then throws", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 503))
    await expect(
      request("https://api/x", { label: "YouTube", retries: 2 })
    ).rejects.toThrow(/YouTube request failed \(503\)/)
    expect(fetchMock).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it("does not retry a 4xx and surfaces the parsed error message", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: { message: "Daily quota exceeded" } }, 403)
    )
    await expect(request("https://api/x", { label: "YouTube" })).rejects.toThrow(
      "YouTube: Daily quota exceeded"
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("falls back to the status when the error body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce(new Response("<html>nope</html>", { status: 400 }))
    await expect(request("https://api/x", { label: "Spotify" })).rejects.toThrow(
      "Spotify request failed (400)."
    )
  })

  it("sends a JSON body with a POST", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ id: "new" }))
    await request("https://api/x", {
      label: "YouTube",
      method: "POST",
      token: "tok",
      body: { title: "Mix" },
    })
    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe("POST")
    expect(init.headers["Content-Type"]).toBe("application/json")
    expect(init.body).toBe(JSON.stringify({ title: "Mix" }))
  })
})
