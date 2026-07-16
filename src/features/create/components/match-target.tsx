import { VideoOff } from "lucide-react"

import { CoverArt } from "@/shared/components/cover-art"
import type { VideoCandidate } from "@/domain/types"

/** Placeholder shown when a track resolved to no video (it will be skipped). */
function NoMatch() {
  return (
    <>
      <div className="bg-panel-inset flex h-[40px] w-[64px] flex-none items-center justify-center border border-[var(--border-subtle)]">
        <VideoOff className="text-fg-fainter size-[18px]" />
      </div>
      <div className="min-w-0">
        <div className="text-fg-muted truncate text-[12px] font-semibold">
          No match found
        </div>
        <div className="text-fg-faint mt-[3px] text-[11px]">
          This track will be skipped
        </div>
      </div>
    </>
  )
}

/** The chosen YouTube video: thumbnail plus title and channel / duration / views. */
function Matched({ candidate }: { candidate: VideoCandidate }) {
  return (
    <>
      <div className="relative h-[40px] w-[64px] flex-none">
        <CoverArt
          seed={candidate.channelTitle || candidate.title}
          src={candidate.thumbnailUrl}
          className="h-[40px] w-[64px]"
          monogramClassName="text-[9px]"
        />
        <span className="absolute top-[3px] left-1 text-[7px] font-semibold tracking-[0.14em] text-[oklch(0.85_0_0/0.6)]">
          ▶ YT
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[12px] font-semibold tracking-[0.02em]">
          {candidate.title}
        </div>
        <div className="text-fg-faint mt-[3px] truncate text-[11px]">
          {[candidate.channelTitle, candidate.durationLabel, candidate.viewCountLabel]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
    </>
  )
}

/** The YouTube side of a review row: the matched video, or a no-match placeholder. */
export function MatchTarget({ chosen }: { chosen?: VideoCandidate }) {
  return chosen ? <Matched candidate={chosen} /> : <NoMatch />
}
