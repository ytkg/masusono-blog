import { useState } from "react"
import NumbersIcon from "@mui/icons-material/Numbers"
import AppsDrawerLauncher from "../ui/AppsDrawerLauncher"
import NumbersPreview from "./NumbersPreview"

const NUMBERS_ENDPOINT = "/app/numbers/metrics.json"

export default function NumbersApp() {
  const [metrics, setMetrics] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const loadMetrics = async () => {
    if (isLoading) return

    setHasError(false)
    setIsLoading(true)
    try {
      const response = await fetch(NUMBERS_ENDPOINT, {
        headers: { Accept: "application/json" },
      })

      if (!response.ok) throw new Error(`failed to fetch ${NUMBERS_ENDPOINT}`)

      const json = await response.json()
      setMetrics(json)
    } catch (_error) {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppsDrawerLauncher
      title="数字でわかる、増田とその他！"
      launcherLabel="数字"
      buttonAriaLabel="数字でわかる、増田とその他！を開く"
      buttonIcon={<NumbersIcon />}
      onOpen={loadMetrics}
    >
      <NumbersPreview metrics={metrics} isLoading={isLoading} hasError={hasError} />
    </AppsDrawerLauncher>
  )
}
