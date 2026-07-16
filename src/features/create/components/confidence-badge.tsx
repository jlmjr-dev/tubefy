import type { Mapping } from "@/domain/types"

type BadgeStatus = "strong" | "review" | "no-match"

const BADGE: Record<BadgeStatus, { color: string; label: string }> = {
  strong: { color: "var(--spotify)", label: "Strong match" },
  review: { color: "var(--amber)", label: "Check match" },
  "no-match": { color: "var(--youtube)", label: "No match" },
}

function statusOf(mapping: Mapping): BadgeStatus {
  if (!mapping.candidates[mapping.chosenIndex]) return "no-match"
  return mapping.confidence === "review" ? "review" : "strong"
}

/** The color-coded confidence pill shown between the track and its match. */
export function ConfidenceBadge({ mapping }: { mapping: Mapping }) {
  const { color, label } = BADGE[statusOf(mapping)]
  return (
    <span
      className="px-[7px] py-[3px] text-[8px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase"
      style={{ color, background: `color-mix(in oklch, ${color} 12%, transparent)` }}
    >
      {label}
    </span>
  )
}
