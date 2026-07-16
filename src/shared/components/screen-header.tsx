import { BackButton } from "@/shared/components/back-button"
import { cn } from "@/shared/lib/utils"

/**
 * The shared header for the browse-style screens (Watch, Create pick, Review): a
 * back link, an eyebrow, a Lora H1, optional subcopy, and an optional right-hand
 * slot for counts / primary actions.
 */
export function ScreenHeader({
  onBack,
  backLabel = "Home",
  eyebrow,
  title,
  subcopy,
  right,
  className,
  contentClassName,
}: {
  onBack: () => void
  backLabel?: string
  eyebrow?: React.ReactNode
  title: string
  subcopy?: string
  right?: React.ReactNode
  className?: string
  /** Constrains/centers the header content (e.g. to line up with a max-width list). */
  contentClassName?: string
}) {
  return (
    <div
      className={cn(
        "px-[clamp(24px,5vw,80px)] py-[clamp(16px,2.6vw,26px)]",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-end justify-between gap-5",
          contentClassName
        )}
      >
        <div className="min-w-0">
          <BackButton onClick={onBack} label={backLabel} />
          {eyebrow ? <div className="mt-4 mb-1.5">{eyebrow}</div> : null}
          <h1 className="font-heading text-[clamp(28px,4vw,48px)] tracking-[0.02em] uppercase">
            {title}
          </h1>
          {subcopy ? (
            <p className="text-fg-faint mt-2 max-w-[440px] text-[13px] leading-[1.5]">
              {subcopy}
            </p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    </div>
  )
}
