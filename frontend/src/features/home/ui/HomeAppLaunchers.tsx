import Box from "@mui/material/Box"
import MasudaRunApp from "@/features/apps/masudaRun/MasudaRunApp"
import NumbersApp from "@/features/apps/numbers/NumbersApp"
import SettingsApp from "@/features/apps/settings/SettingsApp"

export default function HomeAppLaunchers() {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <MasudaRunApp />
      <NumbersApp />
      <SettingsApp />
    </Box>
  )
}
