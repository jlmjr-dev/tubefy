import { useQuery } from "@tanstack/react-query"

import { getYouTubePlaylists } from "@/services/youtube/client"
import { demoYouTubePlaylists } from "@/services/demo/fixtures"
import { demoOr } from "@/services/queries/demo-query"
import { queryKeys } from "@/services/queries/keys"

/** The signed-in user's YouTube playlists, cached across screens. */
export function useYouTubePlaylists() {
  return useQuery({
    queryKey: queryKeys.youtubePlaylists,
    queryFn: demoOr(demoYouTubePlaylists, getYouTubePlaylists),
  })
}
