import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import "./index.css"
import { App } from "@/App"
import { AuthProvider } from "@/context/auth-context"

// Spotify's OAuth requires the loopback IP, not `localhost`. Keep the app on
// 127.0.0.1 so the redirect URI (and the Google JS origin) always line up with
// what you register, regardless of which host you happened to open.
if (window.location.hostname === "localhost") {
  window.location.replace(window.location.href.replace("//localhost", "//127.0.0.1"))
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
