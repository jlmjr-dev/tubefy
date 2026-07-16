import type { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { AuthProvider } from "@/features/auth/auth-context"

// Playlists barely change within a session, so keep results fresh for a few
// minutes: navigating between Home / Watch / Create then reuses the cache
// instead of re-hitting the scarce YouTube quota. Retries are off here because
// the transport layer already retries transient failures.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
})

/** Composition root for app-wide providers: data cache, then auth. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
