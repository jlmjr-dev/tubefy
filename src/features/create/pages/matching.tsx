import { useEffect, useRef, useState } from "react"
import { ArrowRight, AudioLines, MonitorPlay } from "lucide-react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"

import { BackButton } from "@/shared/components/back-button"
import { Eyebrow } from "@/shared/components/eyebrow"
import { useCreate } from "@/features/create/create-context"
import { config } from "@/shared/lib/config"
import { messageOf } from "@/shared/lib/errors"
import { matchTrack } from "@/services/conversion/match-track"
import { getSpotifyPlaylistName, getSpotifyTracks } from "@/services/spotify/client"
import type { Confidence, Mapping } from "@/domain/types"

interface LogEntry {
  title: string
  yt: string
  confidence: Confidence
}

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
  const { setSource, setMappings } = useCreate()

  const initialName = (location.state as { name?: string } | null)?.name ?? ""
  const [name, setName] = useState(initialName)
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState<LogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)
  const advanceTimer = useRef<number | null>(null)

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!listId) {
      navigate("/create", { replace: true })
      return
    }

    async function run() {
      try {
        const playlistName = initialName || (await getSpotifyPlaylistName(listId))
        setName(playlistName)
        const tracks = await getSpotifyTracks(listId, config.maxTracksPerConversion)
        if (tracks.length === 0) {
          setError("This playlist has no tracks to convert.")
          return
        }
        setSource(listId, playlistName)

        // Match tracks with a small pool of concurrent workers instead of one
        // at a time. A modest pool (4) keeps the pipe full without hammering
        // YouTube's rate limits. Results stay in track order; the log streams as
        // each finishes.
        const results: Mapping[] = new Array(tracks.length)
        let completed = 0
        let cursor = 0
        let firstError: string | null = null

        async function worker() {
          for (let i = cursor++; i < tracks.length; i = cursor++) {
            const track = tracks[i]
            let mapping: Mapping
            try {
              mapping = await matchTrack(track)
            } catch (err) {
              // One failed lookup shouldn't sink the whole batch, but keep the
              // real reason so we can surface it instead of a silent "no match".
              if (!firstError) {
                firstError = messageOf(err)
              }
              mapping = { track, candidates: [], chosenIndex: 0, confidence: "review" }
            }
            results[i] = mapping
            completed += 1
            setLog((entries) => [
              ...entries,
              {
                title: track.title,
                yt: mapping.candidates[0]?.title ?? "No match found",
                confidence: mapping.confidence,
              },
            ])
            setProgress(Math.round((completed / tracks.length) * 100))
          }
        }

        await Promise.all(
          Array.from({ length: Math.min(4, tracks.length) }, worker)
        )
        setMappings(results, firstError)
        advanceTimer.current = window.setTimeout(() => navigate("/create/review"), 600)
      } catch (err) {
        setError(messageOf(err, "Matching failed."))
      }
    }

    void run()
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current)
    }
    // Run the matching job exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            <div
              key={i}
              className="flex items-center gap-[11px] text-[13px] [animation:fadeUp_0.3s_both]"
            >
              <span
                className="w-[56px] flex-none text-[9px] font-semibold tracking-[0.14em] uppercase"
                style={{
                  color:
                    entry.confidence === "review" ? "var(--amber)" : "var(--spotify)",
                }}
              >
                {entry.confidence === "review" ? "Review" : "Matched"}
              </span>
              <span className="whitespace-nowrap text-[oklch(0.86_0.01_107)]">
                {entry.title}
              </span>
              <ArrowRight className="text-fg-fainter size-[13px] flex-none" />
              <span className="text-fg-faint min-w-0 flex-1 truncate">{entry.yt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
