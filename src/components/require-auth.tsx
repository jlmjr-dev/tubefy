import { Navigate } from "react-router-dom"

import { useAuth } from "@/context/auth-context"

/** Gate for the post-login screens: bounce to the login gate unless both are connected. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { bothConnected } = useAuth()
  if (!bothConnected) return <Navigate to="/" replace />
  return <>{children}</>
}
