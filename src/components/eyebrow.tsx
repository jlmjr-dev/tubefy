import { cn } from "@/lib/utils"

/**
 * The small uppercase, wide-tracked label used above headings and on tags. Tune
 * size/color/tracking per use via `className`.
 */
export function Eyebrow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-fg-faint text-[10px] font-semibold tracking-[0.3em] uppercase",
        className
      )}
      {...props}
    />
  )
}
