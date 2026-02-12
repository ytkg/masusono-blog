import { useState } from "react"
import NumbersIcon from "@mui/icons-material/Numbers"
import AppsDrawerLauncher from "../ui/AppsDrawerLauncher"
import NumbersPreview from "./NumbersPreview"
import useMetrics from "./hooks/useMetrics"

export default function NumbersApp() {
  const [enabled, setEnabled] = useState(false)
  const { metrics, isLoading, hasError, refresh } = useMetrics(enabled)

  const loadMetrics = async () => {
    if (!enabled) {
      setEnabled(true)
      return
    }

    await refresh()
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
