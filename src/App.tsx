import { Navigate, Outlet, Route, Routes } from "react-router-dom"

import { AppBackground } from "@/shared/components/app-background"
import { RequireAuth } from "@/components/require-auth"
import { CreateProvider } from "@/context/create-context"
import { Callback } from "@/pages/callback/callback"
import { CreatePick } from "@/pages/create/create-pick"
import { Matching } from "@/pages/create/matching"
import { Review } from "@/pages/create/review"
import { Success } from "@/pages/create/success"
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
