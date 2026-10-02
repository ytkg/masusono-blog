import { createTheme } from "@mui/material/styles"

const publicationTheme = createTheme({
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: "'Hiragino Sans', 'Yu Gothic', Meiryo, system-ui, sans-serif",
    body1: { lineHeight: 1.85 },
    button: { fontWeight: 800, textTransform: "none" },
  },
  palette: {
    mode: "light",
    primary: { main: "#304cff" },
    secondary: { main: "#132455" },
    background: { default: "#f0f1ff", paper: "#ffffff" },
    text: { primary: "#132455", secondary: "#596489", disabled: "#8990aa" },
    divider: "#d0d5f0",
    dataVisualization: { totalArticles: "#304cff", totalChars: "#885ad6" },
    success: { main: "#50766b" },
    error: { main: "#c13020" },
    warning: { main: "#906b16" },
    info: { main: "#304cff" },
  },
  components: {
    MuiLink: { styleOverrides: { root: { color: "inherit" } } },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, padding: "10px 22px" },
        contained: { backgroundColor: "#304cff", color: "#fff" },
      },
    },
    MuiAlert: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { fontSize: 14, lineHeight: 1.5 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 700, backgroundColor: "#e6e9ff" } } },
    MuiTab: { styleOverrides: { root: { fontWeight: 800 } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: "#fff", borderRadius: 16 } } },
  },
})
export default publicationTheme
