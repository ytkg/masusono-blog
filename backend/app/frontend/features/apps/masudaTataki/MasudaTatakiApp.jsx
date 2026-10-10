import { useState } from "react"
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"
import MasudaTatakiGame from "./MasudaTatakiGame"

export default function MasudaTatakiApp() {
  const [active, setActive] = useState(false)
  return (
    <AppsDialogLauncher
      title="増田たたき"
      buttonAriaLabel="増田たたきを開く"
      buttonIcon={<SportsEsportsIcon />}
      onOpen={() => setActive(true)}
      onClose={() => setActive(false)}
      contentSx={{ display: "flex", minHeight: 0, overflow: "hidden" }}
    >
      <MasudaTatakiGame active={active} />
    </AppsDialogLauncher>
  )
}
