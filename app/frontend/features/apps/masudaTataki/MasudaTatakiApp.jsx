import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"
import MasudaTatakiGame from "./MasudaTatakiGame"

export default function MasudaTatakiApp() {
  return (
    <AppsDialogLauncher
      title="増田たたき"
      buttonAriaLabel="増田たたきを開く"
      buttonIcon={<SportsEsportsIcon />}
      contentSx={{ display: "flex", minHeight: 0, overflow: "hidden" }}
    >
      <MasudaTatakiGame />
    </AppsDialogLauncher>
  )
}
