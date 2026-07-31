import { useCallback, useState } from "react"
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"
import MasudaRunGame from "./components/MasudaRunGame"
import useRankings from "./hooks/useRankings"
import { getUserIdFromCookie } from "@/shared/lib/userId"

export default function MasudaRunApp() {
  const [enabled, setEnabled] = useState(false)
  const { rankings, rankingsLoading, error, rankingsError, refreshRankings, submitRanking } = useRankings(enabled)

  const loadRankings = async () => {
    if (!enabled) {
      setEnabled(true)
      return
    }

    await refreshRankings()
  }

  const handleScoreSubmit = useCallback(
    async (score) => {
      if (!enabled) return

      const userId = getUserIdFromCookie()
      if (!userId) return

      await submitRanking(score, userId)
    },
    [enabled, submitRanking],
  )

  return (
    <AppsDialogLauncher
      title="増田RUN"
      buttonAriaLabel="増田RUNを開く"
      buttonIcon={<DirectionsRunIcon />}
      onOpen={loadRankings}
    >
      <MasudaRunGame
        rankings={rankings}
        rankingsLoading={rankingsLoading}
        rankingsFetchError={error}
        rankingsError={rankingsError}
        onScoreSubmit={handleScoreSubmit}
      />
    </AppsDialogLauncher>
  )
}
