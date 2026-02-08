import DirectionsRunIcon from "@mui/icons-material/DirectionsRun"
import AppsDrawerLauncher from "@/features/apps/ui/AppsDrawerLauncher"
import MasudaRunGame from "./components/MasudaRunGame"

export default function MasudaRunApp() {
  return (
    <AppsDrawerLauncher title="増田RUN" buttonAriaLabel="増田RUNを開く" buttonIcon={<DirectionsRunIcon />}>
      <MasudaRunGame />
    </AppsDrawerLauncher>
  )
}
