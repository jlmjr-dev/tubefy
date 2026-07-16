import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Wordmark } from "@/shared/components/wordmark"
import { useAuth } from "@/features/auth/auth-context"
import { ConnectCard } from "@/features/auth/components/connect-card"

/** The center bridge between the two cards; lights up indigo when both connect. */
function Bridge({ both }: { both: boolean }) {
  return (
    <div className="flex flex-none items-center justify-center px-[clamp(6px,1.4vw,16px)] py-3 md:py-0">
      <div
        className="bg-background flex size-10 rotate-45 items-center justify-center transition-[border-color,box-shadow] duration-500"
        style={{
          border: `1px solid ${both ? "var(--indigo)" : "oklch(1 0 0 /0.16)"}`,
          boxShadow: both ? "0 0 26px -4px var(--indigo-glow)" : "none",
          color: both ? "var(--indigo)" : "oklch(1 0 0 /0.16)",
        }}
      >
        <span className="font-heading -rotate-45 text-[15px] font-semibold">+</span>
      </div>
    </div>
  )
}

/**
 * Login is the auth gate. The user connects both Spotify and YouTube; only then
 * does "Enter Tubefy" unlock. Ships the "Dual" layout (two side-by-side connect
 * cards joined by a bridge).
 */
export function Login() {
  const { spotify, youtube, bothConnected, connectSpotify, connectYouTube } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-auto px-[clamp(20px,6vw,90px)] py-[clamp(20px,4vw,64px)]">
      <div className="mb-[clamp(24px,4vw,48px)] text-center [animation:fadeUp_0.6s_0.04s_both]">
        <Wordmark variant="hero" />
        <div className="mt-5 flex items-center justify-center gap-[14px]">
          <span className="h-px w-[clamp(28px,6vw,52px)] bg-[oklch(1_0_0/0.24)]" />
          <span className="text-fg-muted text-[11px] tracking-[0.32em] uppercase">
            Where your two libraries meet
          </span>
          <span className="h-px w-[clamp(28px,6vw,52px)] bg-[oklch(1_0_0/0.24)]" />
        </div>
      </div>

      <div className="flex w-full max-w-[820px] flex-col items-stretch justify-center md:flex-row">
        <ConnectCard
          platform="spotify"
          auth={spotify}
          onConnect={connectSpotify}
          delay="0.12s"
        />
        <Bridge both={bothConnected} />
        <ConnectCard
          platform="youtube"
          auth={youtube}
          onConnect={connectYouTube}
          delay="0.2s"
        />
      </div>

      <div className="mt-[clamp(24px,4vw,44px)] flex min-h-[52px] flex-col items-center gap-[14px]">
        {bothConnected ? (
          <button
            type="button"
            onClick={() => navigate("/home")}
            className="bg-indigo text-indigo-on inline-flex h-[52px] items-center gap-3 px-[34px] text-[12px] font-semibold tracking-[0.22em] uppercase transition-[filter,transform] [animation:glow_2.6s_1s_ease-in-out_infinite] hover:brightness-110 active:translate-y-px"
          >
            Enter Tubefy
            <ArrowRight className="size-[17px]" />
          </button>
        ) : (
          <div className="text-fg-fainter text-[11px] tracking-[0.26em] uppercase">
            Connect both to continue
          </div>
        )}
      </div>
    </div>
  )
}
