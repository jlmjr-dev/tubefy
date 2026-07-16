import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Wordmark } from "@/shared/components/wordmark"
import { Eyebrow } from "@/shared/components/eyebrow"
import { useAuth } from "@/context/auth-context"
import { hasSpotifyRedirect } from "@/services/spotify/auth"

/**
 * Landing spot for the Spotify OAuth redirect. Exchanges the authorization code
 * for tokens, then sends the user back to the login gate (which now shows both
 * platforms connected, ready to enter).
 */
export function Callback() {
  const { completeSpotifyLogin } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  // A single-use auth code must not be exchanged twice (StrictMode remounts).
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!hasSpotifyRedirect()) {
      navigate("/", { replace: true })
      return
    }
    completeSpotifyLogin()
      .then(() => navigate("/", { replace: true }))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Authorization failed.")
      )
  }, [completeSpotifyLogin, navigate])

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <Wordmark variant="hero" />
      {error ? (
        <div className="flex flex-col items-center gap-4">
          <Eyebrow className="text-youtube">{error}</Eyebrow>
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="text-indigo-text text-[11px] font-semibold tracking-[0.2em] uppercase"
          >
            Back to login
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <span className="size-4 animate-[spin_0.7s_linear_infinite] rounded-full border-2 border-current border-t-transparent text-indigo" />
          <Eyebrow>Finishing sign-in</Eyebrow>
        </div>
      )}
    </div>
  )
}
