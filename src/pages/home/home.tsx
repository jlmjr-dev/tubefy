import { AudioLines, MonitorPlay } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { ConvertPill, PlayBadge } from "@/shared/components/cover-overlays"
import { Eyebrow } from "@/shared/components/eyebrow"
import { PlaylistCard } from "@/shared/components/playlist-card"
import { PlaylistGrid } from "@/shared/components/playlist-grid"
import { SectionHeading } from "@/shared/components/section-heading"
import { TopBar } from "@/shared/components/top-bar"
import { useAuth } from "@/context/auth-context"
import { useAsync } from "@/hooks/use-async"
import { getSpotifyPlaylists } from "@/services/spotify/client"
import { getYouTubePlaylists } from "@/services/youtube/client"
import { ActionCard } from "@/pages/home/action-card"

function greetingForNow(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

const compactCard = {
  aspectClassName: "aspect-[16/10]",
  monogramClassName: "text-[34px]",
  liftClassName: "hover:-translate-y-[3px]",
  titleClassName: "text-[11px] tracking-[0.06em]",
} as const

/** Home dashboard: entry point to Watch (YouTube) and Create (Spotify). */
export function Home() {
  const navigate = useNavigate()
  const { spotify, youtube } = useAuth()

  const youtubePlaylists = useAsync(() => getYouTubePlaylists(), [])
  const spotifyPlaylists = useAsync(() => getSpotifyPlaylists(), [])

  const firstName = (spotify.profile?.name ?? youtube.profile?.name ?? "there").split(
    " "
  )[0]

  return (
    <div className="absolute inset-0 flex flex-col">
      <TopBar />
      <div className="flex-1 overflow-auto px-[clamp(24px,5vw,80px)] pt-[clamp(6px,1vw,12px)] pb-[clamp(70px,10vh,100px)]">
        <div className="mx-auto max-w-[1080px]">
          <Eyebrow className="mb-2.5 [animation:fadeUp_0.5s_both]">
            {greetingForNow()}, {firstName}
          </Eyebrow>
          <h1 className="font-heading mb-[clamp(22px,3vw,36px)] text-[clamp(30px,4.4vw,54px)] tracking-[0.02em] uppercase [animation:fadeUp_0.5s_0.05s_both]">
            What are we doing tonight?
          </h1>

          <div
            className="mb-[clamp(30px,4vw,48px)] gap-3.5"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(258px, 1fr))",
            }}
          >
            <ActionCard
              eyebrow="Watch"
              title="Play a mix"
              subtitle={
                youtubePlaylists.data
                  ? `${youtubePlaylists.data.length} YouTube playlists ready`
                  : "Play a YouTube playlist"
              }
              Icon={MonitorPlay}
              gradient="linear-gradient(140deg, oklch(0.23 0.035 277), oklch(0.185 0.008 107))"
              hoverBorder="oklch(0.62 0.21 277 / 0.5)"
              iconColor="oklch(0.8 0.1 277)"
              onClick={() => navigate("/watch")}
              animationDelay="0.1s"
            />
            <ActionCard
              eyebrow="Create"
              title="Build a mix"
              subtitle="Convert a Spotify playlist to video"
              Icon={AudioLines}
              gradient="linear-gradient(140deg, oklch(0.22 0.04 305), oklch(0.185 0.008 107))"
              hoverBorder="oklch(0.62 0.16 305 / 0.5)"
              iconColor="oklch(0.8 0.1 305)"
              onClick={() => navigate("/create")}
              animationDelay="0.16s"
            />
          </div>

          <SectionHeading label="Jump back in" platform="youtube" animationDelay="0.2s" />
          <PlaylistGrid
            state={youtubePlaylists}
            columnMin="178px"
            aspectClassName="aspect-[16/10]"
            onReload={youtubePlaylists.reload}
            emptyLabel="No YouTube playlists yet."
          >
            {(items) =>
              items.map((playlist, i) => (
                <PlaylistCard
                  key={playlist.id}
                  {...compactCard}
                  seed={playlist.title}
                  thumbnailUrl={playlist.thumbnailUrl}
                  title={playlist.title}
                  meta={`${playlist.itemCount} videos`}
                  animationDelay={`${i * 0.03}s`}
                  overlay={<PlayBadge />}
                  onClick={() => navigate(`/player?list=${playlist.id}`)}
                />
              ))
            }
          </PlaylistGrid>

          <div className="h-[clamp(28px,4vw,44px)]" />

          <SectionHeading
            label="Ready to convert"
            platform="spotify"
            animationDelay="0.24s"
          />
          <PlaylistGrid
            state={spotifyPlaylists}
            columnMin="178px"
            aspectClassName="aspect-[16/10]"
            onReload={spotifyPlaylists.reload}
            emptyLabel="No Spotify playlists yet."
          >
            {(items) =>
              items.map((playlist, i) => (
                <PlaylistCard
                  key={playlist.id}
                  {...compactCard}
                  seed={playlist.title}
                  thumbnailUrl={playlist.thumbnailUrl}
                  title={playlist.title}
                  meta={`${playlist.itemCount} songs`}
                  animationDelay={`${i * 0.03}s`}
                  overlay={<ConvertPill />}
                  onClick={() =>
                    navigate(`/create/matching?list=${playlist.id}`, {
                      state: { name: playlist.title },
                    })
                  }
                />
              ))
            }
          </PlaylistGrid>
        </div>
      </div>
    </div>
  )
}
