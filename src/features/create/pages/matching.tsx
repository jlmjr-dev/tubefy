import { useEffect } from "react"
import { AudioLines, MonitorPlay } from "lucide-react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { BackButton } from "@/shared/components/back-button"
import { Eyebrow } from "@/shared/components/eyebrow"
import { MatchLogRow } from "@/features/create/components/match-log-row"
import { useMatchingJob } from "@/features/create/hooks/use-matching-job"

/** Bridge node (Spotify / YouTube) flanking the sweeping connector line. */
function BridgeNode({
  Icon,
  color,
  label,
}: {
  Icon: typeof AudioLines
  color: string
  label: string
}) {
  return (
    <div className="flex flex-none flex-col items-center gap-[9px]">
      <div
        className="flex size-[50px] items-center justify-center border"
        style={{
          background: `color-mix(in oklch, ${color} 14%, transparent)`,
          borderColor: `color-mix(in oklch, ${color} 40%, transparent)`,
          color,
        }}
      >
        <Icon className="size-[22px]" />
      </div>
      <Eyebrow className="tracking-[0.2em]">{label}</Eyebrow>
    </div>
  )
}

/** Matching: resolve each Spotify track to a YouTube video, streaming progress. */
export function Matching() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const listId = params.get("list") ?? ""
  const initialName = (location.state as { name?: string } | null)?.name ?? ""

  const { name, progress, log, error, done } = useMatchingJob(listId, initialName)

  // No playlist selected: bounce back to the picker.
  useEffect(() => {
    if (!listId) navigate("/create", { replace: true })
  }, [listId, navigate])

  // Auto-advance to review a beat after matching completes.
  useEffect(() => {
    if (!done) return
    const timer = window.setTimeout(() => navigate("/create/review"), 600)
    return () => window.clearTimeout(timer)
  }, [done, navigate])

  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
        <Eyebrow className="text-youtube">{error}</Eyebrow>
        <BackButton onClick={() => navigate("/create")} label="Back to playlists" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-auto px-[clamp(20px,6vw,90px)] pt-[clamp(24px,5vw,80px)] pb-[clamp(80px,10vh,110px)]">
      <Eyebrow>Creating · {name}</Eyebrow>
      <h1 className="font-heading my-3 mb-[clamp(28px,4vw,44px)] text-center text-[clamp(30px,5vw,58px)] tracking-[0.02em] uppercase">
        Matching your tracks
      </h1>

      <div className="mb-[clamp(28px,4vw,42px)] flex w-full max-w-[520px] items-center">
        <BridgeNode Icon={AudioLines} color="var(--spotify)" label="Spotify" />
        <div className="relative mx-1 h-[2px] flex-1 overflow-hidden bg-[oklch(1_0_0/0.12)]">
          <div className="absolute top-0 left-0 h-[2px] w-[44px] animate-[sweep_1.1s_linear_infinite] bg-[linear-gradient(90deg,transparent,oklch(0.72_0.16_277),transparent)]" />
        </div>
        <BridgeNode Icon={MonitorPlay} color="var(--youtube)" label="YouTube" />
      </div>

      <div className="w-full max-w-[520px]">
        <div className="mb-2.5 flex items-baseline justify-between">
          <Eyebrow className="tracking-[0.24em]">Building playlist</Eyebrow>
          <span className="font-heading text-[24px]">{progress}%</span>
        </div>
        <div className="relative h-[4px] overflow-hidden bg-[oklch(1_0_0/0.12)]">
          <div
            className="bg-indigo absolute inset-y-0 left-0 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-[22px] flex min-h-[150px] flex-col gap-[9px]">
          {log.map((entry, i) => (
            <MatchLogRow key={i} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  )
}
