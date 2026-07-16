import { Check } from "lucide-react"

import { CoverArt } from "@/shared/components/cover-art"
import type { VideoCandidate } from "@/domain/types"

/** One alternate-video card in the inline remap panel. */
export function CandidateCard({
  candidate,
  active,
  label,
  onClick,
}: {
  candidate: VideoCandidate
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[236px] flex-none border p-2.5 text-left transition-[border-color,background]"
      style={{
        borderColor: active ? "var(--indigo)" : "var(--border)",
        background: active ? "oklch(0.62 0.21 277 / 0.1)" : "transparent",
      }}
    >
      <div className="relative mb-2.5">
        <CoverArt
          seed={candidate.channelTitle || candidate.title}
          src={candidate.thumbnailUrl}
          className="aspect-video w-full"
          monogramClassName="text-[20px]"
        />
        <span className="absolute top-[5px] left-1.5 text-[7px] font-semibold tracking-[0.14em] text-[oklch(0.85_0_0/0.6)]">
          ▶ YT
        </span>
        {active ? (
          <div className="bg-indigo absolute top-1.5 right-1.5 flex size-5 items-center justify-center">
            <Check className="size-3 text-[oklch(0.98_0_0)]" strokeWidth={3} />
          </div>
        ) : null}
      </div>
      <div className="text-indigo-text mb-[5px] text-[8px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </div>
      <div className="mb-[5px] line-clamp-2 text-[12px] leading-[1.35]">
        {candidate.title}
      </div>
      <div className="text-fg-faint text-[11px]">
        {[candidate.channelTitle, candidate.durationLabel, candidate.viewCountLabel]
          .filter(Boolean)
          .join(" · ")}
      </div>
    </button>
  )
}
