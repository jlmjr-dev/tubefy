import { ArrowRight, Check, ChevronDown, VideoOff } from "lucide-react"

import { CoverArt } from "@/shared/components/cover-art"
import { Eyebrow } from "@/shared/components/eyebrow"
import type { Mapping, VideoCandidate } from "@/lib/types"
import { cn } from "@/shared/lib/utils"

/** One alternate-video card in the inline remap panel. */
function CandidateCard({
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
}: {
  mapping: Mapping
  index: number
  isOpen: boolean
  onToggle: () => void
  onChoose: (candidateIndex: number) => void
}) {
  const { track } = mapping
  const chosen = mapping.candidates[mapping.chosenIndex]
  const noMatch = !chosen
  const review = mapping.confidence === "review"
  const badgeColor = noMatch
    ? "var(--youtube)"
    : review
      ? "var(--amber)"
      : "var(--spotify)"
  const badgeBg = noMatch
    ? "color-mix(in oklch, var(--youtube) 12%, transparent)"
    : review
      ? "color-mix(in oklch, var(--amber) 12%, transparent)"
      : "color-mix(in oklch, var(--spotify) 12%, transparent)"
  const badgeLabel = noMatch ? "No match" : review ? "Check match" : "Strong match"

  return (
    <div className="bg-panel-row border border-[var(--border-subtle)] [animation:fadeUp_0.4s_both]">
      <div
        className={cn(
          "flex flex-wrap items-center gap-[clamp(10px,1.8vw,20px)] p-[clamp(12px,1.5vw,16px)]",
          noMatch && "opacity-55"
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
          <span
            className="px-[7px] py-[3px] text-[8px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase"
            style={{ color: badgeColor, background: badgeBg }}
          >
            {badgeLabel}
          </span>
        </div>

        <div className="flex min-w-[210px] flex-1 basis-[250px] items-center gap-3">
          {noMatch ? (
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
          ) : (
            <>
              <div className="relative h-[40px] w-[64px] flex-none">
                <CoverArt
                  seed={chosen.channelTitle || chosen.title}
                  src={chosen.thumbnailUrl}
                  className="h-[40px] w-[64px]"
                  monogramClassName="text-[9px]"
                />
                <span className="absolute top-[3px] left-1 text-[7px] font-semibold tracking-[0.14em] text-[oklch(0.85_0_0/0.6)]">
                  ▶ YT
                </span>
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold tracking-[0.02em]">
                  {chosen.title}
                </div>
                <div className="text-fg-faint mt-[3px] truncate text-[11px]">
                  {[chosen.channelTitle, chosen.durationLabel, chosen.viewCountLabel]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            </>
          )}
        </div>

        {mapping.candidates.length > 1 ? (
          <button
            type="button"
            onClick={onToggle}
            className="text-fg-muted hover:border-indigo inline-flex flex-none items-center gap-[7px] border border-[oklch(1_0_0/0.14)] px-3 py-[9px] text-[9px] font-semibold tracking-[0.16em] uppercase transition-colors hover:text-[oklch(0.95_0_0)]"
          >
            Change
            <ChevronDown className="size-[13px]" />
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className="bg-panel-inset border-t border-[var(--border-subtle)] p-4">
          <Eyebrow className="mb-3 tracking-[0.24em]">Pick the right video</Eyebrow>
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
        </div>
      ) : null}
    </div>
  )
}
