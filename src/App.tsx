import { Navigate, Route, Routes } from "react-router-dom"

import { AppBackground } from "@/components/app-background"
import { Login } from "@/pages/login/login"

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
