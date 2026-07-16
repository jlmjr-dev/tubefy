import type { ReactNode } from "react"

import { AuthProvider } from "@/features/auth/auth-context"

/** Composition root for app-wide providers (auth today, data cache next). */
export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
