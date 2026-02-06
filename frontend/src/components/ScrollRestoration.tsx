import { useEffect } from "react"
import { useLocation } from "react-router-dom"

export default function ScrollRestoration() {
  const location = useLocation()

  // biome-ignore lint/correctness/useExhaustiveDependencies: ルート変更時にのみ発火させる
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [location.pathname, location.search])

  return null
}
