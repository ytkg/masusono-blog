import NumbersIcon from "@mui/icons-material/Numbers"
import DrawerLauncher from "@/features/apps/components/DrawerLauncher"
import NumbersPreview from "./components/NumbersPreview"

export default function NumbersApp() {
  return (
    <DrawerLauncher
      title="数字でわかる、増田とその他！"
      launcherLabel="数字"
      buttonAriaLabel="数字でわかる、増田とその他！を開く"
      buttonIcon={<NumbersIcon />}
    >
      <NumbersPreview />
    </DrawerLauncher>
  )
}
