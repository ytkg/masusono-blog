import { createRoot, hydrateRoot } from "react-dom/client"
import { createInertiaApp, router } from "@inertiajs/react"
import InertiaApp from "../shared/InertiaApp"
import { resolvePage } from "../shared/pageResolver"
import { installAnalyticsNavigation } from "../shared/lib/analytics"
import { installNavigationRecovery } from "../shared/lib/navigationRecovery"

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

installNavigationRecovery(router)
installAnalyticsNavigation(router)

createInertiaApp({
  resolve: resolvePage,
  setup({ el, App, props }) {
    registerServiceWorker()
    const app = <InertiaApp App={App} props={props} />
    if (el.hasAttribute("data-server-rendered")) {
      hydrateRoot(el, app)
    } else {
      createRoot(el).render(app)
    }
  },
})
