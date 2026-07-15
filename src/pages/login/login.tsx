import { Wordmark } from "@/components/wordmark"

/**
 * Login is the auth gate: the user connects both Spotify and YouTube before the
 * rest of the app unlocks. This first pass lays out the cinematic hero; the dual
 * connect cards and OAuth wiring are added once the auth layer exists.
 */
export function Login() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-auto px-[clamp(20px,6vw,90px)] py-[clamp(20px,4vw,64px)]">
      <div className="mb-[clamp(24px,4vw,48px)] text-center [animation:fadeUp_0.6s_0.04s_both]">
        <Wordmark variant="hero" />
        <div className="mt-5 flex items-center justify-center gap-[14px]">
          <span className="h-px w-[clamp(28px,6vw,52px)] bg-[oklch(1_0_0/0.24)]" />
          <span className="text-[11px] tracking-[0.32em] text-fg-muted uppercase">
            Where your two libraries meet
          </span>
          <span className="h-px w-[clamp(28px,6vw,52px)] bg-[oklch(1_0_0/0.24)]" />
        </div>
      </div>
    </div>
  )
}
