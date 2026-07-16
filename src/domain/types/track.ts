/** A Spotify track, the source side of a match. */
export interface Track {
  id: string
  title: string
  /** All artists joined for display, e.g. "Artist A, Artist B". */
  artists: string
  primaryArtist: string
  album?: string
  durationMs: number
  durationLabel: string
  isrc?: string
}
