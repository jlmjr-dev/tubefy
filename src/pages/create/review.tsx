import { useRef, useState } from "react"
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
  const { mappings, playlistName, chooseCandidate, setCreated, matchError } = useCreate()
  const [expanded, setExpanded] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Survives a failed attempt so a retry resumes the same playlist rather than
  // creating a duplicate on the user's channel.
  const buildProgress = useRef<{ playlistId?: string; inserted: number }>({ inserted: 0 })

  if (mappings.length === 0) return <Navigate to="/create" replace />

  const matched = mappings.filter((m) => m.candidates.length > 0)
  const strongCount = matched.filter((m) => m.confidence !== "review").length
  const reviewCount = matched.filter((m) => m.confidence === "review").length
  const noMatchCount = mappings.length - matched.length

  const confirm = async () => {
    if (creating || matched.length === 0) return
    setCreating(true)
    setError(null)
    try {
      const chosenCount = mappings.filter((m) => m.candidates[m.chosenIndex]).length
      const { playlistId } = await buildYouTubePlaylist(playlistName, mappings, {
        existingPlaylistId: buildProgress.current.playlistId,
        startIndex: buildProgress.current.inserted,
        onCreated: (id) => {
          buildProgress.current.playlistId = id
        },
        onProgress: (n) => {
          buildProgress.current.inserted = n
        },
      })
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
        contentClassName="mx-auto w-full max-w-[1080px]"
        eyebrow={<Eyebrow>Review · {playlistName}</Eyebrow>}
        title="Review matches"
        right={
          <div className="flex flex-wrap items-center gap-[18px]">
            <div className="flex gap-4">
              <Stat value={strongCount} label="Strong" color="var(--spotify)" />
              <Stat value={reviewCount} label="To check" color="var(--amber)" />
              {noMatchCount > 0 ? (
                <Stat value={noMatchCount} label="No match" color="var(--youtube)" />
              ) : null}
            </div>
            <button
              type="button"
              onClick={confirm}
              disabled={creating || matched.length === 0}
              title={
                matched.length === 0 ? "No matched videos to create a playlist from" : undefined
              }
              className="bg-indigo text-indigo-on inline-flex h-[46px] items-center gap-2.5 px-6 text-[11px] font-semibold tracking-[0.2em] uppercase transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
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
      {noMatchCount > 0 ? (
        <div className="px-[clamp(24px,5vw,80px)] pb-2">
          <div className="text-fg-faint mx-auto max-w-[1080px] text-[12px] leading-[1.5]">
            {noMatchCount} track{noMatchCount > 1 ? "s" : ""} couldn&rsquo;t be matched and
            will be skipped.{" "}
            {matchError
              ? matchError
              : "This usually means YouTube's daily search limit was reached, which resets each day."}
          </div>
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
