import Box from "@mui/material/Box"
import MasudaRunApp from "../apps/masudaRun/MasudaRunApp"
import NumbersApp from "../apps/numbers/NumbersApp"
import SettingsApp from "../apps/settings/SettingsApp"
import ZukanApp from "../apps/zukan/ZukanApp"

export default function HomeAppLaunchers() {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <MasudaRunApp />
      <NumbersApp />
      <ZukanApp />
      <SettingsApp />
    </Box>
  )
}
