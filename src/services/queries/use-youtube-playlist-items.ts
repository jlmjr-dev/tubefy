import { useQuery } from "@tanstack/react-query"

import { getYouTubePlaylistItems } from "@/services/youtube/client"
import { queryKeys } from "@/services/queries/keys"

/** The playable videos of one YouTube playlist. Idle until a list id is known. */
export function useYouTubePlaylistItems(listId: string) {
  return useQuery({
    queryKey: queryKeys.youtubePlaylistItems(listId),
    queryFn: () => getYouTubePlaylistItems(listId),
    enabled: Boolean(listId),
  })
}
