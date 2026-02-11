import { useEffect } from "react"
import { usePage } from "@inertiajs/react"

export default function ScrollRestoration() {
  const { url } = usePage()
  const path = String(url ?? "/")

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [path])

  return null
}
