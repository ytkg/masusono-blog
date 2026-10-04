import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import theme from "../theme"
import NavigationFailureDialog from "../components/NavigationFailureDialog"

export default function AppProviders({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
      <NavigationFailureDialog />
    </ThemeProvider>
  )
}
