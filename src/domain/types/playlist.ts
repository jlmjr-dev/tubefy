import type { Platform } from "@/domain/types/platform"

export interface Playlist {
  id: string
  title: string
  owner?: string
  itemCount: number
  thumbnailUrl?: string
  source: Platform
  /** Human duration label when known. */
  durationLabel?: string
}
