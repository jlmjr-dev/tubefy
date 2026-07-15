/**
 * The fixed cinematic backdrop shared by every screen: an indigo glow from the
 * top, a faint violet wash bottom-right, a subtle film grain, and two hairline
 * rules that frame the content column. Purely decorative, never interactive.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function AppBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_-12%,oklch(0.62_0.21_277/0.18),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_100%_110%,oklch(0.55_0.16_300/0.10),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-5 mix-blend-screen"
        style={{ backgroundImage: NOISE }}
      />
      <div className="absolute top-0 bottom-0 left-[clamp(24px,5vw,80px)] w-px bg-[linear-gradient(oklch(1_0_0/0),oklch(1_0_0/0.06)_20%,oklch(1_0_0/0.06)_80%,oklch(1_0_0/0))]" />
      <div className="absolute top-0 right-[clamp(24px,5vw,80px)] bottom-0 w-px bg-[linear-gradient(oklch(1_0_0/0),oklch(1_0_0/0.06)_20%,oklch(1_0_0/0.06)_80%,oklch(1_0_0/0))]" />
    </div>
  )
}
