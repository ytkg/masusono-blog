import { useState } from "react"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"
import GreedGame from "./GreedGame"

export default function GreedApp() {
  const [session, setSession] = useState(0)
  return (
    <AppsDialogLauncher
      onClose={() => setSession((value) => value + 1)}
      title="強欲は身を滅ぼす？"
      launcherLabel="強欲"
      buttonAriaLabel="強欲を開く"
      buttonIcon={<ShoppingCartIcon />}
    >
      <GreedGame key={session} />
    </AppsDialogLauncher>
  )
}
