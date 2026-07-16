import { useNavigate } from "react-router-dom"

import { PlayBadge } from "@/shared/components/cover-overlays"
import { Eyebrow } from "@/shared/components/eyebrow"
import { PlaylistCard } from "@/shared/components/playlist-card"
import { PlaylistGrid } from "@/shared/components/playlist-grid"
import { ScreenHeader } from "@/shared/components/screen-header"
import { useYouTubePlaylists } from "@/services/queries/use-youtube-playlists"

/** Watch browse: pick a YouTube playlist to play. */
export function WatchBrowse() {
  const navigate = useNavigate()
  const playlists = useYouTubePlaylists()

  return (
    <div className="absolute inset-0 flex flex-col">
      <ScreenHeader
        onBack={() => navigate("/home")}
        eyebrow={<Eyebrow>Watch · YouTube</Eyebrow>}
        title="Your playlists"
        right={
          playlists.data ? (
            <div className="text-fg-faint text-[11px] font-semibold tracking-[0.2em] uppercase">
              {playlists.data.length} playlists
            </div>
          ) : undefined
        }
      />
      <div className="flex-1 overflow-auto px-[clamp(24px,5vw,80px)] pt-[clamp(6px,1vw,10px)] pb-[clamp(74px,10vh,102px)]">
        <div className="mx-auto max-w-[1180px]">
          <PlaylistGrid
            state={playlists}
            columnMin="224px"
            aspectClassName="aspect-square"
            onReload={playlists.refetch}
            emptyLabel="No YouTube playlists yet."
          >
            {(items) =>
              items.map((playlist, i) => (
                <PlaylistCard
                  key={playlist.id}
                  seed={playlist.title}
                  thumbnailUrl={playlist.thumbnailUrl}
                  title={playlist.title}
                  animationDelay={`${i * 0.03}s`}
                  topLeft={
                    <span className="text-[9px] font-semibold tracking-[0.2em] text-[oklch(0.85_0_0/0.7)] uppercase">
                      {playlist.itemCount} videos
                    </span>
                  }
                  overlay={<PlayBadge size={54} iconSize={22} />}
                  onClick={() => navigate(`/player?list=${playlist.id}`)}
                />
              ))
            }
          </PlaylistGrid>
        </div>
      </div>
    </div>
  )
}
