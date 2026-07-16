/** Formatting helpers for durations and view counts. */

/** Milliseconds -> "m:ss" (Spotify track durations). */
export function formatMs(ms: number): string {
  const total = Math.round(ms / 1000)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

/** Seconds -> "m:ss" or "h:mm:ss". */
export function formatSeconds(sec: number): string {
  const s = Math.max(0, Math.round(sec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rem = s % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`
  }
  return `${m}:${String(rem).padStart(2, "0")}`
}

const ISO_DURATION = /P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/

/** ISO 8601 duration (YouTube `contentDetails.duration`, e.g. "PT4M13S") -> seconds. */
export function parseIsoDuration(iso: string): number {
  const match = ISO_DURATION.exec(iso)
  if (!match) return 0
  const [, d, h, m, s] = match
  return (
    Number(d || 0) * 86400 +
    Number(h || 0) * 3600 +
    Number(m || 0) * 60 +
    Number(s || 0)
  )
}

/** 12_000_000 -> "12M views". */
export function formatViewCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return ""
  if (count >= 1e9) return `${trim(count / 1e9)}B views`
  if (count >= 1e6) {
    // 999.95M would round to "1000.0M"; promote to B.
    return count / 1e6 >= 999.95 ? "1B views" : `${trim(count / 1e6)}M views`
  }
  if (count >= 1e3) {
    const thousands = Math.round(count / 1e3)
    return thousands >= 1000 ? "1M views" : `${thousands}K views`
  }
  return `${count} views`
}

function trim(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "")
}
