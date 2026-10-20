import { useEffect } from "react"
import AppProviders from "./AppProviders"

export default function InertiaApp({ App, props }) {
  useEffect(() => {
    const root = document.getElementById("app")
    root.dataset.clientReady = "true"
    return () => delete root.dataset.clientReady
  }, [])

  return (
    <AppProviders>
      <App {...props} />
    </AppProviders>
  )
}
