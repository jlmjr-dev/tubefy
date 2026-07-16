import { Check, Play } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"

import { Eyebrow } from "@/shared/components/eyebrow"
import { useCreate } from "@/context/create-context"

const CONFETTI_COLORS = [
  "var(--indigo)",
  "oklch(0.72 0.16 300)",
  "var(--spotify)",
  "var(--youtube)",
  "oklch(0.92 0.02 107)",
]

// Deterministic falling squares (indigo / violet / green / red / white).
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 61 + 7) % 100,
  delay: (i % 8) * 0.32,
  duration: 2.8 + (i % 5) * 0.5,
  size: 6 + (i % 3) * 4,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
}))

/** Success: confirm creation, then hand off to watching the new playlist. */
export function Success() {
  const navigate = useNavigate()
  const { created } = useCreate()

  if (!created) return <Navigate to="/home" replace />

  // Leaving /create unmounts the CreateProvider, so state clears on its own.
  // (Calling reset() here would null `created` first and bounce us to /home.)
  const watchNow = () => navigate(`/player?list=${created.id}`)
  const backHome = () => navigate("/home")

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-[clamp(20px,6vw,90px)] pt-[clamp(24px,5vw,80px)] pb-[clamp(80px,10vh,110px)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {CONFETTI.map((c, i) => (
          <div
            key={i}
            className="absolute -top-6"
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size,
              background: c.color,
              animation: `fall ${c.duration}s ${c.delay}s linear infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-[560px] text-center">
        <div className="mx-auto flex size-[74px] rotate-45 items-center justify-center border border-[var(--indigo)] [animation:glow_2.6s_ease-in-out_infinite,scaleIn_0.5s_both]">
          <Check
            className="-rotate-45 text-[oklch(0.75_0.15_277)]"
            style={{ width: 32, height: 32 }}
            strokeWidth={2.4}
          />
        </div>
        <Eyebrow className="mt-7 [animation:fadeUp_0.5s_0.1s_both]">
          Created on YouTube
        </Eyebrow>
        <h1 className="font-heading mt-3 mb-4 text-[clamp(34px,5.5vw,64px)] tracking-[0.02em] uppercase [animation:fadeUp_0.5s_0.16s_both]">
          Playlist ready
        </h1>
        <p className="text-fg-muted mb-8 text-[15px] leading-[1.65] [animation:fadeUp_0.5s_0.22s_both]">
          “{created.name}” — {created.count} music videos matched from Spotify and
          saved to your YouTube library.
        </p>
        <div className="flex flex-wrap justify-center gap-3 [animation:fadeUp_0.5s_0.28s_both]">
          <button
            type="button"
            onClick={watchNow}
            className="bg-indigo text-indigo-on inline-flex h-[52px] items-center gap-[11px] px-[30px] text-[12px] font-semibold tracking-[0.2em] uppercase transition-[filter,transform] hover:brightness-110 active:translate-y-px"
          >
            <Play className="size-[18px]" fill="currentColor" strokeWidth={0} />
            Watch now
          </button>
          <button
            type="button"
            onClick={backHome}
            className="text-fg-muted inline-flex h-[52px] items-center gap-[9px] border border-[oklch(1_0_0/0.16)] px-[26px] text-[12px] font-semibold tracking-[0.2em] uppercase transition-colors hover:border-[var(--fg-muted)] hover:text-[oklch(0.98_0_0)]"
          >
            Back home
          </button>
        </div>
      </div>
    </div>
  )
}
