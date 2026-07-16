import { useState } from "react"
import { Link2 } from "lucide-react"

import { usePasteVideo } from "@/features/create/hooks/use-paste-video"
import type { VideoCandidate } from "@/domain/types"

/**
 * A paste-a-YouTube-link escape hatch for when none of the auto-found candidates
 * is right. Resolves the link to a real video and adds it as the chosen match.
 */
export function PasteVideo({ onAdd }: { onAdd: (candidate: VideoCandidate) => void }) {
  const [url, setUrl] = useState("")
  const { pending, error, submit } = usePasteVideo(onAdd)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!url.trim() || pending) return
    const ok = await submit(url)
    if (ok) setUrl("")
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-center gap-2.5">
      <Link2 className="text-fg-fainter size-[15px] flex-none" />
      <input
        type="text"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="Paste a YouTube link to use a different video"
        className="text-fg-muted h-9 min-w-[240px] flex-1 border border-[var(--border-subtle)] bg-[oklch(1_0_0/0.03)] px-3 text-[12px] outline-none placeholder:text-[var(--fg-fainter)] focus:border-[var(--indigo)]"
      />
      <button
        type="submit"
        disabled={pending || !url.trim()}
        className="bg-indigo text-indigo-on inline-flex h-9 flex-none items-center px-4 text-[10px] font-semibold tracking-[0.18em] uppercase transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Adding…" : "Use link"}
      </button>
      {error ? (
        <span className="text-youtube w-full text-[11px] leading-[1.4]">{error}</span>
      ) : null}
    </form>
  )
}
