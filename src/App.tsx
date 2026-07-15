import { Navigate, Route, Routes } from "react-router-dom"

import { AppBackground } from "@/components/app-background"
import { RequireAuth } from "@/components/require-auth"
import { Callback } from "@/pages/callback/callback"
import { Home } from "@/pages/home/home"
import { Login } from "@/pages/login/login"
import { Player } from "@/pages/player/player"
import { WatchBrowse } from "@/pages/watch/watch-browse"

/**
 * The app is a full-viewport cinematic stage: a fixed backdrop with one routed
 * screen layered on top. Routes are added screen by screen as the flow is built
 * out (login -> home -> watch/create).
 */
export function App() {
  return (
    <>
      <AppBackground />
      <main className="fixed inset-0 overflow-hidden">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/callback" element={<Callback />} />
          <Route
            path="/home"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/watch"
            element={
              <RequireAuth>
                <WatchBrowse />
              </RequireAuth>
            }
          />
          <Route
            path="/player"
            element={
              <RequireAuth>
                <Player />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
