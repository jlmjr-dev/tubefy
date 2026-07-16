import { useQuery } from "@tanstack/react-query"

import { getYouTubePlaylistItems } from "@/services/youtube/client"
import { demoQueue } from "@/services/demo/fixtures"
import { demoOr } from "@/services/queries/demo-query"
import { queryKeys } from "@/services/queries/keys"

/** The playable videos of one YouTube playlist. Idle until a list id is known. */
export function useYouTubePlaylistItems(listId: string) {
  return useQuery({
    queryKey: queryKeys.youtubePlaylistItems(listId),
    queryFn: demoOr(demoQueue, () => getYouTubePlaylistItems(listId)),
    enabled: Boolean(listId),
  })
}
