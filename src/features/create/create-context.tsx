/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import type { Mapping, VideoCandidate } from "@/domain/types"

export interface CreatedPlaylist {
  id: string
  name: string
  count: number
  reviewCount: number
}

interface CreateContextValue {
  playlistId: string
  playlistName: string
  mappings: Mapping[]
  created: CreatedPlaylist | null
  /** The real error from the last matching run, if any tracks failed to look up. */
  matchError: string | null
  setSource: (id: string, name: string) => void
  setMappings: (mappings: Mapping[], matchError?: string | null) => void
  chooseCandidate: (rowIndex: number, candidateIndex: number) => void
  /** Append a manually pasted video to a row and select it. */
  addCandidate: (rowIndex: number, candidate: VideoCandidate) => void
  setCreated: (created: CreatedPlaylist) => void
  reset: () => void
}

const CreateContext = React.createContext<CreateContextValue | undefined>(undefined)

/** Holds the Create flow's working state across matching -> review -> success. */
export function CreateProvider({ children }: { children: React.ReactNode }) {
  const [playlistId, setPlaylistId] = React.useState("")
  const [playlistName, setPlaylistName] = React.useState("")
  const [mappings, setMappingsState] = React.useState<Mapping[]>([])
  const [created, setCreatedState] = React.useState<CreatedPlaylist | null>(null)
  const [matchError, setMatchError] = React.useState<string | null>(null)

  const setSource = React.useCallback((id: string, name: string) => {
    setPlaylistId(id)
    setPlaylistName(name)
  }, [])

  const setMappings = React.useCallback(
    (next: Mapping[], error: string | null = null) => {
      setMappingsState(next)
      setMatchError(error)
    },
    []
  )

  const chooseCandidate = React.useCallback(
    (rowIndex: number, candidateIndex: number) => {
      setMappingsState((prev) =>
        prev.map((mapping, i) =>
          i === rowIndex ? { ...mapping, chosenIndex: candidateIndex } : mapping
        )
      )
    },
    []
  )

  const addCandidate = React.useCallback(
    (rowIndex: number, candidate: VideoCandidate) => {
      setMappingsState((prev) =>
        prev.map((mapping, i) =>
          i === rowIndex
            ? {
                ...mapping,
                candidates: [...mapping.candidates, candidate],
                chosenIndex: mapping.candidates.length,
                // A deliberate paste is treated as a confident choice.
                confidence: "strong",
              }
            : mapping
        )
      )
    },
    []
  )

  const setCreated = React.useCallback((next: CreatedPlaylist) => {
    setCreatedState(next)
  }, [])

  const reset = React.useCallback(() => {
    setPlaylistId("")
    setPlaylistName("")
    setMappingsState([])
    setCreatedState(null)
    setMatchError(null)
  }, [])

  const value = React.useMemo<CreateContextValue>(
    () => ({
      playlistId,
      playlistName,
      mappings,
      created,
      matchError,
      setSource,
      setMappings,
      chooseCandidate,
      addCandidate,
      setCreated,
      reset,
    }),
    [
      playlistId,
      playlistName,
      mappings,
      created,
      matchError,
      setSource,
      setMappings,
      chooseCandidate,
      addCandidate,
      setCreated,
      reset,
    ]
  )

  return <CreateContext.Provider value={value}>{children}</CreateContext.Provider>
}

export function useCreate(): CreateContextValue {
  const context = React.useContext(CreateContext)
  if (!context) throw new Error("useCreate must be used within a CreateProvider")
  return context
}
