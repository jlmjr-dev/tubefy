import { useState } from "react"
import { Check } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"

import { Eyebrow } from "@/components/eyebrow"
import { ScreenHeader } from "@/components/screen-header"
import { useCreate } from "@/context/create-context"
import { buildYouTubePlaylist } from "@/lib/youtube/create-playlist"
import { ReviewRow } from "@/pages/create/review-row"

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <div className="font-heading text-[22px]" style={{ color }}>
        {value}
      </div>
      <div className="text-fg-faint text-[9px] font-semibold tracking-[0.18em] uppercase">
        {label}
      </div>
    </div>
  )
}

/** Review & remap: check each auto-match, fix the shaky ones, then create. */
export function Review() {
  const navigate = useNavigate()
  const { mappings, playlistName, chooseCandidate, setCreated } = useCreate()
  const [expanded, setExpanded] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (mappings.length === 0) return <Navigate to="/create" replace />

  const strongCount = mappings.filter((m) => m.confidence !== "review").length
  const reviewCount = mappings.filter((m) => m.confidence === "review").length

  const confirm = async () => {
    if (creating) return
    setCreating(true)
    setError(null)
    try {
      const chosenCount = mappings.filter((m) => m.candidates[m.chosenIndex]).length
      const playlistId = await buildYouTubePlaylist(playlistName, mappings)
      setCreated({
        id: playlistId,
        name: playlistName,
        count: chosenCount,
        reviewCount,
      })
      navigate("/create/success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the playlist.")
      setCreating(false)
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col">
      <ScreenHeader
        onBack={() => navigate("/create")}
        backLabel="Playlists"
        eyebrow={<Eyebrow>Review · {playlistName}</Eyebrow>}
        title="Review matches"
        right={
          <div className="flex flex-wrap items-center gap-[18px]">
            <div className="flex gap-4">
              <Stat value={strongCount} label="Strong" color="var(--spotify)" />
              <Stat value={reviewCount} label="To check" color="var(--amber)" />
            </div>
            <button
              type="button"
              onClick={confirm}
              disabled={creating}
              className="bg-indigo text-indigo-on inline-flex h-[46px] items-center gap-2.5 px-6 text-[11px] font-semibold tracking-[0.2em] uppercase transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:opacity-70"
            >
              {creating ? (
                "Creating…"
              ) : (
                <>
                  Confirm &amp; create
                  <Check className="size-4" />
                </>
              )}
            </button>
          </div>
        }
      />
      {error ? (
        <div className="text-youtube px-[clamp(24px,5vw,80px)] pb-2 text-[12px]">
          {error}
        </div>
      ) : null}
      <div className="flex-1 overflow-auto px-[clamp(24px,5vw,80px)] pt-[clamp(4px,1vw,8px)] pb-[clamp(78px,10vh,106px)]">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-2.5">
          {mappings.map((mapping, i) => (
            <ReviewRow
              key={i}
              mapping={mapping}
              index={i}
              isOpen={expanded === i}
              onToggle={() => setExpanded((e) => (e === i ? null : i))}
              onChoose={(ci) => chooseCandidate(i, ci)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
