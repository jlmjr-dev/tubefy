import { ArrowLeft } from "lucide-react"

import { cn } from "@/shared/lib/utils"

/** The muted "<- Label" back link used in screen headers and the player chrome. */
export function BackButton({
  onClick,
  label,
  className,
}: {
  onClick: () => void
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-fg-muted hover:text-foreground inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors",
        className
      )}
    >
      <ArrowLeft className="size-[15px]" />
      {label}
    </button>
  )
}
