import Box from "@mui/material/Box"
import MasudaRunApp from "../apps/masudaRun/MasudaRunApp"
import NumbersApp from "../apps/numbers/NumbersApp"
import SettingsApp from "../apps/settings/SettingsApp"

export default function HomeAppLaunchers() {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <MasudaRunApp />
      <NumbersApp />
      <SettingsApp />
    </Box>
  )
}
