import { useState } from "react"
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"
import AppsDrawerLauncher from "../ui/AppsDrawerLauncher"
import MasudaRunGame from "./components/MasudaRunGame"

const RANKINGS_ENDPOINT = "/app/masuda_run/rankings.json"

export default function MasudaRunApp() {
  const [rankings, setRankings] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const loadRankings = async () => {
    if (isLoading) return

    setHasError(false)
    setIsLoading(true)
    try {
      const response = await fetch(RANKINGS_ENDPOINT, {
        headers: { Accept: "application/json" },
      })

      if (!response.ok) throw new Error(`failed to fetch ${RANKINGS_ENDPOINT}`)

      const json = await response.json()
      setRankings(json)
    } catch (_error) {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppsDrawerLauncher title="増田RUN" buttonAriaLabel="増田RUNを開く" buttonIcon={<DirectionsRunIcon />} onOpen={loadRankings}>
      <MasudaRunGame rankings={rankings} rankingsLoading={isLoading} rankingsError={hasError} />
    </AppsDrawerLauncher>
  )
}
