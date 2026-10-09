import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

export default function TrendChartTooltip({ point, series, colors }) {
  return (
    <Box
      role="status"
      sx={{
        position: "absolute",
        top: 8,
        left: "50%",
        transform: "translateX(-50%)",
        width: "max-content",
        maxWidth: "calc(100% - 16px)",
        px: 1.5,
        py: 1,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
        boxShadow: 2,
        pointerEvents: "none",
      }}
    >
      <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.5 }}>{point.label ?? point.date}</Typography>
      {series.map((item, index) => (
        <Box key={item.key} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography sx={{ fontSize: 14, color: colors[index % colors.length] }}>{item.label}</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
            {Number.isFinite(point[item.key]) ? new Intl.NumberFormat("ja-JP").format(point[item.key]) : "—"}{" "}
            {item.unit}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
