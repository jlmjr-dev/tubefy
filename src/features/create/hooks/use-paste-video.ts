import { useCallback, useState } from "react"

import { messageOf } from "@/shared/lib/errors"
import { getVideoById } from "@/services/youtube/client"
import { parseYouTubeVideoId } from "@/services/youtube/video-id"
import type { VideoCandidate } from "@/domain/types"

export interface PasteVideo {
  pending: boolean
  error: string | null
  /** Resolve a pasted link to a video and hand it to `onAdd`. Returns true on success. */
  submit: (input: string) => Promise<boolean>
}

/** Turns a pasted YouTube link into a candidate, with parse / fetch validation. */
export function usePasteVideo(onAdd: (candidate: VideoCandidate) => void): PasteVideo {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (input: string) => {
      const videoId = parseYouTubeVideoId(input)
      if (!videoId) {
        setError("That doesn't look like a YouTube link.")
        return false
      }
      setPending(true)
      setError(null)
      try {
        const candidate = await getVideoById(videoId)
        if (!candidate) {
          setError("Couldn't find that video on YouTube.")
          return false
        }
        onAdd(candidate)
        return true
      } catch (err) {
        setError(messageOf(err, "Couldn't load that video."))
        return false
      } finally {
        setPending(false)
      }
    },
    [onAdd]
  )

  return { pending, error, submit }
}
