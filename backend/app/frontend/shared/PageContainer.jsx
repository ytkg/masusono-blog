import Box from "@mui/material/Box"

export default function PageContainer({ children, component = "section", id, sx }) {
  return (
    <Box component={component} id={id} sx={[{ px: { xs: 2, sm: 3 }, py: 2 }, sx]}>
      {children}
    </Box>
  )
}
