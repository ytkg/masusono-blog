import { useState } from "react"
import CasinoIcon from "@mui/icons-material/Casino"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"
import MasudaSlotGame from "./MasudaSlotGame"

export default function MasudaSlotApp() {
  const [session, setSession] = useState(0)
  return (
    <AppsDialogLauncher
      edgeToEdge
      preserveSiteHeader
      title="増田の野望"
      launcherLabel="増田スロット"
      buttonAriaLabel="増田スロットを開く"
      buttonIcon={<CasinoIcon />}
      contentSx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}
      onClose={() => setSession((value) => value + 1)}
    >
      <MasudaSlotGame key={session} />
    </AppsDialogLauncher>
  )
}
