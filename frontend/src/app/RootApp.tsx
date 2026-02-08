import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { StrictMode, useEffect } from "react"
import { BrowserRouter } from "react-router-dom"
import theme from "@/theme"
import App from "./App"

function useServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration?.unregister().catch((err) => {
          console.error("Service worker unregister failed:", err)
        })
      })
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((key) => key.startsWith("masusono-cache-")).map((key) => caches.delete(key))),
        )
        .catch((err) => {
          console.warn("Failed to clear service worker caches in dev:", err)
        })
      return
    }

    navigator.serviceWorker.register("/service-worker.js", { scope: "/" }).catch((err) => {
      console.error("Service worker registration failed:", err)
    })
  }, [])
}

export function RootApp() {
  useServiceWorkerRegistration()

  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>
  )
}
