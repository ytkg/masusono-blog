import Box from "@mui/material/Box"
import MasudaRunApp from "@/features/apps/masudaRun/MasudaRunApp"
import NumbersApp from "@/features/apps/numbers/NumbersApp"

export default function HomeAppLaunchers() {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <MasudaRunApp />
      <NumbersApp />
    </Box>
  )
}
