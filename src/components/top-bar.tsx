import { CoverArt } from "@/components/cover-art"
import { PlatformTag } from "@/components/platform-tag"
import { Wordmark } from "@/components/wordmark"
import { useAuth } from "@/context/auth-context"

/** Home's top bar: wordmark left; connected platform chips + user avatar right. */
export function TopBar() {
  const { spotify, youtube } = useAuth()
  const name = spotify.profile?.name ?? youtube.profile?.name ?? "You"
  const avatarUrl = spotify.profile?.avatarUrl ?? youtube.profile?.avatarUrl

  return (
    <div className="z-[3] flex flex-none flex-wrap items-center justify-between gap-4 px-[clamp(24px,5vw,80px)] py-[clamp(16px,2.6vw,26px)]">
      <Wordmark variant="bar" />
      <div className="flex flex-wrap items-center gap-3">
        <PlatformTag platform="spotify" variant="chip" />
        <PlatformTag platform="youtube" variant="chip" />
        <div className="flex items-center gap-[9px] pl-1">
          <CoverArt
            seed={name}
            src={avatarUrl}
            className="size-[30px]"
            monogramClassName="text-[11px]"
          />
          <span className="text-[12px]">{name}</span>
        </div>
      </div>
    </div>
  )
}
