import { ArrowRight, ChevronDown } from "lucide-react"

import { CoverArt } from "@/shared/components/cover-art"
import { Eyebrow } from "@/shared/components/eyebrow"
import { CandidateCard } from "@/features/create/components/candidate-card"
import { ConfidenceBadge } from "@/features/create/components/confidence-badge"
import { MatchTarget } from "@/features/create/components/match-target"
import { PasteVideo } from "@/features/create/components/paste-video"
import type { Mapping, VideoCandidate } from "@/domain/types"
import { cn } from "@/shared/lib/utils"

/**
 * One review row: the Spotify track on the left, an arrow + confidence badge in
 * the middle, and the mapped YouTube video on the right. "Change" expands an
 * inline panel of candidate videos to remap the match.
 */
export function ReviewRow({
  mapping,
  index,
  isOpen,
  onToggle,
  onChoose,
  onAddVideo,
}: {
  mapping: Mapping
  index: number
  isOpen: boolean
  onToggle: () => void
  onChoose: (candidateIndex: number) => void
  onAddVideo: (candidate: VideoCandidate) => void
}) {
  const { track } = mapping
  const chosen = mapping.candidates[mapping.chosenIndex]

  return (
    <div className="bg-panel-row border border-[var(--border-subtle)] [animation:fadeUp_0.4s_both]">
      <div
        className={cn(
          "flex flex-wrap items-center gap-[clamp(10px,1.8vw,20px)] p-[clamp(12px,1.5vw,16px)]",
          !chosen && "opacity-55"
        )}
      >
        <span className="font-heading text-fg-fainter flex-none text-[15px]">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="flex min-w-[190px] flex-1 basis-[230px] items-center gap-3">
          <div className="relative size-[46px] flex-none">
            <CoverArt
              seed={track.artists || track.title}
              className="size-[46px]"
              monogramClassName="text-[12px]"
            />
            <span className="bg-spotify absolute right-1 bottom-1 size-[7px]" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold tracking-[0.03em]">
              {track.title}
            </div>
            <div className="text-fg-faint mt-[3px] truncate text-[11px]">
              {track.artists} · {track.durationLabel}
            </div>
          </div>
        </div>

        <div className="flex flex-none flex-col items-center gap-1.5 px-1">
          <ArrowRight className="size-[18px] text-[oklch(0.55_0.06_277)]" />
          <ConfidenceBadge mapping={mapping} />
        </div>

        <div className="flex min-w-[210px] flex-1 basis-[250px] items-center gap-3">
          <MatchTarget chosen={chosen} />
        </div>

        <button
          type="button"
          onClick={onToggle}
          className="text-fg-muted hover:border-indigo inline-flex flex-none items-center gap-[7px] border border-[oklch(1_0_0/0.14)] px-3 py-[9px] text-[9px] font-semibold tracking-[0.16em] uppercase transition-colors hover:text-[oklch(0.95_0_0)]"
        >
          {chosen ? "Change" : "Add video"}
          <ChevronDown
            className={cn("size-[13px] transition-transform", isOpen && "rotate-180")}
          />
        </button>
      </div>

      {isOpen ? (
        <div className="bg-panel-inset border-t border-[var(--border-subtle)] p-4">
          <Eyebrow className="mb-3 tracking-[0.24em]">
            {mapping.candidates.length > 0 ? "Pick the right video" : "Paste the right video"}
          </Eyebrow>
          {mapping.candidates.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {mapping.candidates.map((candidate, ci) => (
                <CandidateCard
                  key={candidate.videoId}
                  candidate={candidate}
                  active={ci === mapping.chosenIndex}
                  label={ci === 0 ? "Auto-matched" : "Alternate"}
                  onClick={() => onChoose(ci)}
                />
              ))}
            </div>
          ) : null}
          <PasteVideo onAdd={onAddVideo} />
        </div>
      ) : null}
    </div>
  )
}
