import { useNavigate } from "react-router-dom"

import { BuildPill } from "@/components/cover-overlays"
import { Eyebrow } from "@/components/eyebrow"
import { PlaylistCard } from "@/components/playlist-card"
import { PlaylistGrid } from "@/components/playlist-grid"
import { ScreenHeader } from "@/components/screen-header"
import { useAsync } from "@/hooks/use-async"
import { getSpotifyPlaylists } from "@/lib/spotify/api"

/** Create pick: choose a Spotify playlist to convert into a YouTube video mix. */
export function CreatePick() {
  const navigate = useNavigate()
  const playlists = useAsync(() => getSpotifyPlaylists(), [])

  return (
    <div className="absolute inset-0 flex flex-col">
      <ScreenHeader
        onBack={() => navigate("/home")}
        eyebrow={
          <div className="flex items-center gap-[9px]">
            <span className="bg-spotify size-[7px]" />
            <Eyebrow>Create · Spotify</Eyebrow>
          </div>
        }
        title="Choose a playlist"
        subcopy="Pick one and Tubefy builds a matching music-video playlist on your YouTube."
        right={
          <div className="text-fg-faint text-[11px] font-semibold tracking-[0.2em] uppercase">
            {playlists.data?.length ?? 0} playlists
          </div>
        }
      />
      <div className="flex-1 overflow-auto px-[clamp(24px,5vw,80px)] pt-[clamp(6px,1vw,10px)] pb-[clamp(74px,10vh,102px)]">
        <div className="mx-auto max-w-[1180px]">
          <PlaylistGrid
            state={playlists}
            columnMin="224px"
            aspectClassName="aspect-square"
            onReload={playlists.reload}
            emptyLabel="No Spotify playlists yet."
          >
            {(items) =>
              items.map((playlist, i) => (
                <PlaylistCard
                  key={playlist.id}
                  seed={playlist.title}
                  thumbnailUrl={playlist.thumbnailUrl}
                  title={playlist.title}
                  meta={`${playlist.owner ?? "You"} · ${playlist.itemCount} songs`}
                  animationDelay={`${i * 0.03}s`}
                  topLeft={
                    <div className="flex items-center gap-[6px]">
                      <span className="bg-spotify size-[6px]" />
                      <span className="text-[9px] font-semibold tracking-[0.2em] text-[oklch(0.85_0_0/0.7)] uppercase">
                        Spotify
                      </span>
                    </div>
                  }
                  overlay={<BuildPill />}
                  onClick={() => navigate(`/create/matching?list=${playlist.id}`)}
                />
              ))
            }
          </PlaylistGrid>
        </div>
      </div>
    </div>
  )
}
