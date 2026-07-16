/**
 * Deterministic grayscale placeholders. When real album art / thumbnails are
 * missing we fall back to a two-tone diagonal gradient plus a faint monogram,
 * seeded off a stable string so the same playlist always looks the same. Mirrors
 * the prototype's `g(l1, l2, angle)` helper.
 */

function hash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function coverGradient(seed: string): string {
  const h = hash(seed || "tubefy")
  const l1 = (0.24 + (h % 11) / 100).toFixed(3) // 0.24 - 0.34
  const l2 = (0.14 + (Math.floor(h / 11) % 7) / 100).toFixed(3) // 0.14 - 0.20
  const angle = 110 + (Math.floor(h / 77) % 51) // 110 - 160
  return `linear-gradient(${angle}deg, oklch(${l1} 0.006 107), oklch(${l2} 0.006 107))`
}

export function monogram(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "TB"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
