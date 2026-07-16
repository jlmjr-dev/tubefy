import type { ReactNode } from "react"

import { PlaylistCard } from "@/shared/components/playlist-card"
import { PlaylistGrid, type GridState } from "@/shared/components/playlist-grid"
import { SectionHeading } from "@/shared/components/section-heading"
import type { Platform, Playlist } from "@/domain/types"

const cardStyle = {
  aspectClassName: "aspect-[16/10]",
  monogramClassName: "text-[34px]",
  liftClassName: "hover:-translate-y-[3px]",
  titleClassName: "text-[11px] tracking-[0.06em]",
} as const

/**
 * A titled row of playlist tiles on the home dashboard. Parameterized so the
 * YouTube ("jump back in") and Spotify ("ready to convert") shelves share one
 * implementation, differing only by copy, badge, and where a tile navigates.
 */
export function PlaylistSection({
  label,
  platform,
  animationDelay,
  state,
  onReload,
  emptyLabel,
  meta,
  overlay,
  onPick,
}: {
  label: string
  platform: Platform
  animationDelay: string
  state: GridState<Playlist>
  onReload: () => void
  emptyLabel: string
  meta: (playlist: Playlist) => string
  overlay: ReactNode
  onPick: (playlist: Playlist) => void
}) {
  return (
    <>
      <SectionHeading label={label} platform={platform} animationDelay={animationDelay} />
      <PlaylistGrid
        state={state}
        columnMin="178px"
        aspectClassName="aspect-[16/10]"
        onReload={onReload}
        emptyLabel={emptyLabel}
      >
        {(items) =>
          items.map((playlist, i) => (
            <PlaylistCard
              key={playlist.id}
              {...cardStyle}
              seed={playlist.title}
              thumbnailUrl={playlist.thumbnailUrl}
              title={playlist.title}
              meta={meta(playlist)}
              animationDelay={`${i * 0.03}s`}
              overlay={overlay}
              onClick={() => onPick(playlist)}
            />
          ))
        }
      </PlaylistGrid>
    </>
  )
}
