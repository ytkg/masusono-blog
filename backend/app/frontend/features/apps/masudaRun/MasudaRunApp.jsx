import { useState } from "react"
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"
import AppsDrawerLauncher from "../ui/AppsDrawerLauncher"
import MasudaRunGame from "./components/MasudaRunGame"
import useRankings from "./hooks/useRankings"

export default function MasudaRunApp() {
  const [enabled, setEnabled] = useState(false)
  const { rankings, rankingsLoading, rankingsError, refreshRankings } = useRankings(enabled)

  const loadRankings = async () => {
    if (!enabled) {
      setEnabled(true)
      return
    }

    await refreshRankings()
  }

  return (
    <AppsDrawerLauncher
      title="増田RUN"
      buttonAriaLabel="増田RUNを開く"
      buttonIcon={<DirectionsRunIcon />}
      onOpen={loadRankings}
    >
      <MasudaRunGame rankings={rankings} rankingsLoading={rankingsLoading} rankingsError={rankingsError} />
    </AppsDrawerLauncher>
  )
}
