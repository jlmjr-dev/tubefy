import { ArrowRight } from "lucide-react"

import type { MatchLogEntry } from "@/features/create/hooks/use-matching-job"

/** One streamed line of the matching log: the track, an arrow, and its result. */
export function MatchLogRow({ entry }: { entry: MatchLogEntry }) {
  const review = entry.confidence === "review"
  return (
    <div className="flex items-center gap-[11px] text-[13px] [animation:fadeUp_0.3s_both]">
      <span
        className="w-[56px] flex-none text-[9px] font-semibold tracking-[0.14em] uppercase"
        style={{ color: review ? "var(--amber)" : "var(--spotify)" }}
      >
        {review ? "Review" : "Matched"}
      </span>
      <span className="whitespace-nowrap text-[oklch(0.86_0.01_107)]">{entry.title}</span>
      <ArrowRight className="text-fg-fainter size-[13px] flex-none" />
      <span className="text-fg-faint min-w-0 flex-1 truncate">{entry.yt}</span>
    </div>
  )
}
