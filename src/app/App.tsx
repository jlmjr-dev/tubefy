import { Navigate, Outlet, Route, Routes } from "react-router-dom"

import { AppBackground } from "@/shared/components/app-background"
import { RequireAuth } from "@/features/auth/require-auth"
import { CreateProvider } from "@/features/create/create-context"
import { Callback } from "@/features/auth/pages/callback"
import { CreatePick } from "@/features/create/pages/create-pick"
import { Matching } from "@/features/create/pages/matching"
import { Review } from "@/features/create/pages/review"
import { Success } from "@/features/create/pages/success"
import { Home } from "@/features/home/pages/home"
import { Login } from "@/features/auth/pages/login"
import { Player } from "@/features/player/pages/player"
import { WatchBrowse } from "@/features/watch/pages/watch-browse"

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
          <Route
            path="/create"
            element={
              <RequireAuth>
                <CreateProvider>
                  <Outlet />
                </CreateProvider>
              </RequireAuth>
            }
          >
            <Route index element={<CreatePick />} />
            <Route path="matching" element={<Matching />} />
            <Route path="review" element={<Review />} />
            <Route path="success" element={<Success />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
