import { itemLabelTextSx } from "@/shared/typographyStyles"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"

export default function SettingsSection({ label, children }) {
  return (
    <Card variant="outlined">
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, py: 1.5 }}>
        <Typography variant="body2" sx={itemLabelTextSx}>
          {label}
        </Typography>
        {children}
      </CardContent>
    </Card>
  )
}
