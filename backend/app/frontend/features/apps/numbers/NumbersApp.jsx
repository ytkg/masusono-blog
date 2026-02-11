import NumbersIcon from "@mui/icons-material/Numbers"
import AppsDrawerLauncher from "../ui/AppsDrawerLauncher"
import NumbersPreview from "./NumbersPreview"

export default function NumbersApp() {
  return (
    <AppsDrawerLauncher
      title="数字でわかる、増田とその他！"
      launcherLabel="数字"
      buttonAriaLabel="数字でわかる、増田とその他！を開く"
      buttonIcon={<NumbersIcon />}
    >
      <NumbersPreview />
    </AppsDrawerLauncher>
  )
}
