import Box from "@mui/material/Box"
import { PAGE_HORIZONTAL_PADDING } from "./pageLayout"

export default function PageContainer({ children, component = "section", id, sx }) {
  return (
    <Box component={component} id={id} sx={[{ px: PAGE_HORIZONTAL_PADDING, py: 2 }, sx]}>
      {children}
    </Box>
  )
}
