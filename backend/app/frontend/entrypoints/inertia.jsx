import { createRoot } from "react-dom/client"
import { createInertiaApp } from "@inertiajs/react"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import AppLayout from "../layouts/AppLayout"
import theme from "../theme"
import "../styles/index.css"

function registerServiceWorker() {
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
}

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob("../pages/**/*.jsx", { eager: true })
    const page = pages[`../pages/${name}.jsx`]
    page.default.layout = page.default.layout || ((pageNode) => <AppLayout>{pageNode}</AppLayout>)
    return page
  },
  setup({ el, App, props }) {
    registerServiceWorker()
    createRoot(el).render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App {...props} />
      </ThemeProvider>,
    )
  },
})
