import { useEffect, useRef, useState } from "react"

import { useCreate } from "@/features/create/create-context"
import { config } from "@/shared/lib/config"
import { messageOf } from "@/shared/lib/errors"
import { runMatching } from "@/services/conversion/run-matching"
import { getSpotifyPlaylistName, getSpotifyTracks } from "@/services/spotify/client"
import type { Confidence } from "@/domain/types"

export interface MatchLogEntry {
  title: string
  yt: string
  confidence: Confidence
}

export interface MatchingJob {
  name: string
  progress: number
  log: MatchLogEntry[]
  error: string | null
  /** True once matching has finished and the mappings are in the create store. */
  done: boolean
}

/**
 * Runs the whole conversion job once for a Spotify list: fetch its name and
 * tracks, resolve each to a YouTube video, stream progress, and hand the result
 * to the create store. UI-only concerns (navigation, layout) stay in the screen.
 */
export function useMatchingJob(listId: string, initialName: string): MatchingJob {
  const { setSource, setMappings } = useCreate()
  const [name, setName] = useState(initialName)
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState<MatchLogEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || !listId) return
    started.current = true

    async function run() {
      try {
        const playlistName = initialName || (await getSpotifyPlaylistName(listId))
        setName(playlistName)
        const tracks = await getSpotifyTracks(listId, config.maxTracksPerConversion)
        if (tracks.length === 0) {
          setError("This playlist has no tracks to convert.")
          return
        }
        setSource(listId, playlistName)

        let completed = 0
        const { mappings, firstError } = await runMatching(tracks, {
          onResult: (mapping) => {
            completed += 1
            setLog((entries) => [
              ...entries,
              {
                title: mapping.track.title,
                yt: mapping.candidates[0]?.title ?? "No match found",
                confidence: mapping.confidence,
              },
            ])
            setProgress(Math.round((completed / tracks.length) * 100))
          },
        })
        setMappings(mappings, firstError)
        setDone(true)
      } catch (err) {
        setError(messageOf(err, "Matching failed."))
      }
    }

    void run()
    // Run the matching job exactly once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { name, progress, log, error, done }
}
