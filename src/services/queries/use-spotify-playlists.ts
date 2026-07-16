import { useQuery } from "@tanstack/react-query"

import { getSpotifyPlaylists } from "@/services/spotify/client"
import { queryKeys } from "@/services/queries/keys"

/** The signed-in user's Spotify playlists, cached across screens. */
export function useSpotifyPlaylists() {
  return useQuery({
    queryKey: queryKeys.spotifyPlaylists,
    queryFn: getSpotifyPlaylists,
  })
}
