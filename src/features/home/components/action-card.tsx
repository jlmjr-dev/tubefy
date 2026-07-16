import { ArrowRight, type LucideIcon } from "lucide-react"

/** One of Home's two big entry panels (Watch / Create). */
export function ActionCard({
  eyebrow,
  title,
  subtitle,
  Icon,
  gradient,
  hoverBorder,
  iconColor,
  onClick,
  animationDelay = "0s",
}: {
  eyebrow: string
  title: string
  subtitle: string
  Icon: LucideIcon
  gradient: string
  hoverBorder: string
  iconColor: string
  onClick: () => void
  animationDelay?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-border group relative block cursor-pointer overflow-hidden border p-[clamp(20px,2.4vw,30px)] text-left transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:[border-color:var(--hover-border)]"
      style={
        {
          background: gradient,
          "--hover-border": hoverBorder,
          animation: `fadeUp 0.5s ${animationDelay} both`,
        } as React.CSSProperties
      }
    >
      <div className="mb-[26px] flex items-center justify-between">
        <div
          className="flex size-[42px] items-center justify-center bg-[oklch(1_0_0/0.06)]"
          style={{ color: iconColor }}
        >
          <Icon className="size-5" />
        </div>
        <ArrowRight className="text-fg-muted size-[18px]" />
      </div>
      <div className="text-fg-faint text-[10px] tracking-[0.28em] uppercase">{eyebrow}</div>
      <div className="font-heading mt-[5px] mb-2 text-[26px] uppercase">{title}</div>
      <div className="text-[13px] text-[oklch(0.66_0.02_107)]">{subtitle}</div>
    </button>
  )
}
