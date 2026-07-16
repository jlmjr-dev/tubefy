/** Stable query keys for the data cache. Grouped by platform + resource. */
export const queryKeys = {
  youtubePlaylists: ["youtube", "playlists"] as const,
  youtubePlaylistItems: (listId: string) =>
    ["youtube", "playlist-items", listId] as const,
  spotifyPlaylists: ["spotify", "playlists"] as const,
}
