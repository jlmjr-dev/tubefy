import type { CSSProperties } from "react"

import { BackButton } from "@/shared/components/back-button"

const pad = (n: number) => String(n).padStart(2, "0")

/** Top player chrome: back to playlists, the now-playing counter, focus-mode tag. */
export function PlayerTopBar({
  index,
  total,
  onBack,
  style,
}: {
  index: number
  total: number
  onBack: () => void
  style: CSSProperties
}) {
  return (
    <div
      className="absolute top-0 right-0 left-0 flex items-center justify-between gap-4 bg-[linear-gradient(oklch(0.075_0.004_107/0.85),transparent)] px-[clamp(20px,4vw,54px)] py-[clamp(16px,2.4vw,26px)] transition-opacity duration-[350ms]"
      style={style}
    >
      <BackButton onClick={onBack} label="Playlists" />
      <div className="text-fg-faint text-[9px] font-semibold tracking-[0.3em] uppercase">
        Now playing · {pad(index + 1)} / {pad(total)}
      </div>
      <div className="text-fg-fainter text-[9px] font-semibold tracking-[0.24em] uppercase">
        Focus mode
      </div>
    </div>
  )
}
