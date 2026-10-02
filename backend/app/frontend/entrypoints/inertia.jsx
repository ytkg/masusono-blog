import { createRoot } from "react-dom/client"
import { createInertiaApp, router } from "@inertiajs/react"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import theme from "../publicationTheme"
import NavigationFailureDialog from "../components/NavigationFailureDialog"
import { installNavigationRecovery } from "../shared/lib/navigationRecovery"
import { installAppleStartupImage } from "../shared/lib/appleStartupImage"

installAppleStartupImage()
void import("../styles/fonts.css")

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

const pages = import.meta.glob(["../pages/**/*.jsx", "!../pages/**/*.test.jsx", "!../pages/**/*.spec.jsx"])

function resolvePageLoader(name) {
  const normalized = String(name)
  const lower = normalized.toLowerCase()
  const candidates = [
    `../pages/${normalized}.jsx`,
    `../pages/${normalized}/index.jsx`,
    `../pages/${lower}.jsx`,
    `../pages/${lower}/index.jsx`,
  ]

  const matchedPath = candidates.find((path) => pages[path])
  if (!matchedPath) {
    throw new Error(`Inertia page not found: ${name}`)
  }

  return pages[matchedPath]
}

installNavigationRecovery(router)

createInertiaApp({
  resolve: async (name) => {
    const page = await resolvePageLoader(name)()
    if (!page.default.layout) {
      const { default: AppLayout } = await import("../layouts/AppLayout")
      page.default.layout = (pageNode) => <AppLayout>{pageNode}</AppLayout>
    }
    return page
  },
  setup({ el, App, props }) {
    registerServiceWorker()
    createRoot(el).render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App {...props} />
        <NavigationFailureDialog />
      </ThemeProvider>,
    )
  },
})
