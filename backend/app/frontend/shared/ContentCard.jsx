import Box from "@mui/material/Box"

export default function ContentCard({ children, sx }) {
  return (
    <Box
      sx={[
        {
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: { xs: 2, sm: 2.5 },
          bgcolor: "background.paper",
        },
        sx,
      ]}
    >
      {children}
    </Box>
  )
}
