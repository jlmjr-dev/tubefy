/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

import type { Mapping } from "@/lib/types"

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
  setSource: (id: string, name: string) => void
  setMappings: (mappings: Mapping[]) => void
  chooseCandidate: (rowIndex: number, candidateIndex: number) => void
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

  const setSource = React.useCallback((id: string, name: string) => {
    setPlaylistId(id)
    setPlaylistName(name)
  }, [])

  const setMappings = React.useCallback((next: Mapping[]) => {
    setMappingsState(next)
  }, [])

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

  const setCreated = React.useCallback((next: CreatedPlaylist) => {
    setCreatedState(next)
  }, [])

  const reset = React.useCallback(() => {
    setPlaylistId("")
    setPlaylistName("")
    setMappingsState([])
    setCreatedState(null)
  }, [])

  const value = React.useMemo<CreateContextValue>(
    () => ({
      playlistId,
      playlistName,
      mappings,
      created,
      setSource,
      setMappings,
      chooseCandidate,
      setCreated,
      reset,
    }),
    [
      playlistId,
      playlistName,
      mappings,
      created,
      setSource,
      setMappings,
      chooseCandidate,
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
