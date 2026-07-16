import { AudioLines, Check, MonitorPlay, type LucideIcon } from "lucide-react"

import { CoverArt } from "@/shared/components/cover-art"
import type { PlatformAuth, PlatformKey } from "@/context/auth-context"
import { cn } from "@/shared/lib/utils"

interface PlatformMeta {
  brand: string
  eyebrow: string
  title: string
  copy: string
  Icon: LucideIcon
  checkStroke: string
}

const PLATFORM: Record<PlatformKey, PlatformMeta> = {
  spotify: {
    brand: "var(--spotify)",
    eyebrow: "Music library",
    title: "Spotify",
    copy: "Import your playlists so Tubefy can build their music-video twins on YouTube.",
    Icon: AudioLines,
    checkStroke: "oklch(0.15 0.01 150)",
  },
  youtube: {
    brand: "var(--youtube)",
    eyebrow: "Video library",
    title: "YouTube",
    copy: "Grant access so we can create playlists and play the videos back to you here.",
    Icon: MonitorPlay,
    checkStroke: "oklch(0.98 0 0)",
  },
}

function Spinner() {
  return (
    <span className="inline-block size-[14px] animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-current border-t-transparent" />
  )
}

/**
 * One platform's connect panel on the login gate. Drives its border, check badge,
 * and body off the auth state: idle -> connecting -> connected. The brand color
 * (Spotify green / YouTube red) is exposed as `--brand` and used only here.
 */
export function ConnectCard({
  platform,
  auth,
  onConnect,
  delay,
}: {
  platform: PlatformKey
  auth: PlatformAuth
  onConnect: () => void
  delay: string
}) {
  const meta = PLATFORM[platform]

  return (
    <div
      className="bg-panel relative flex w-full flex-col gap-[18px] overflow-hidden p-[clamp(22px,3vw,30px)] transition-[border-color,box-shadow] duration-500 md:w-auto md:min-w-[270px] md:flex-1 md:basis-[300px]"
      style={
        {
          "--brand": meta.brand,
          border: `1px solid ${auth.connected ? "var(--brand)" : "var(--border)"}`,
          animation: `fadeUp 0.6s ${delay} both`,
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: "var(--brand)" }} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[13px]">
          <div
            className="flex size-11 items-center justify-center border border-[oklch(1_0_0/0.09)] bg-[oklch(1_0_0/0.05)]"
            style={{ color: "var(--brand)" }}
          >
            <meta.Icon className="size-5" />
          </div>
          <div>
            <div className="text-fg-faint text-[10px] tracking-[0.28em] uppercase">
              {meta.eyebrow}
            </div>
            <div className="font-heading text-[21px] leading-[1.1] tracking-[0.05em] uppercase">
              {meta.title}
            </div>
          </div>
        </div>
        {auth.connected ? (
          <div
            className="flex size-[26px] items-center justify-center"
            style={{ background: "var(--brand)" }}
          >
            <Check className="size-[15px]" strokeWidth={3} style={{ color: meta.checkStroke }} />
          </div>
        ) : null}
      </div>

      {auth.connected ? (
        <div className="mt-auto flex items-center gap-3">
          <CoverArt
            seed={auth.profile?.name ?? meta.title}
            src={auth.profile?.avatarUrl}
            className="size-10"
            monogramClassName="text-[12px]"
          />
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold tracking-[0.02em]">
              {auth.profile?.name ?? "Connected"}
            </div>
            <div className="text-fg-faint text-[11px]">
              Connected
              {auth.profile?.playlistCount != null
                ? ` · ${auth.profile.playlistCount} playlists`
                : ""}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-fg-muted text-[13px] leading-[1.55]">{meta.copy}</div>
          {auth.error ? (
            <div className="text-[12px] leading-[1.45]" style={{ color: "var(--brand)" }}>
              {auth.error}
            </div>
          ) : null}
          <button
            type="button"
            onClick={onConnect}
            disabled={auth.loading}
            className={cn(
              "mt-auto inline-flex h-11 items-center justify-center gap-[9px] px-5 text-[11px] font-semibold tracking-[0.2em] uppercase transition-[background,transform] active:translate-y-px disabled:opacity-70",
              "hover:bg-[color-mix(in_oklch,var(--brand)_12%,transparent)]"
            )}
            style={{ color: "var(--brand)", border: "1px solid var(--brand)" }}
          >
            {auth.loading ? (
              <>
                <Spinner /> Connecting
              </>
            ) : (
              `Connect ${meta.title}`
            )}
          </button>
        </>
      )}
    </div>
  )
}
