import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: "'Hiragino Sans', 'Yu Gothic', Meiryo, system-ui, sans-serif",
    h1: { fontWeight: 900, letterSpacing: "-0.05em" },
    h2: { fontWeight: 900, letterSpacing: "-0.04em" },
    h6: { fontWeight: 800 },
    body1: { lineHeight: 1.85 },
    button: { fontWeight: 700, textTransform: "none" },
  },
  palette: {
    mode: "light",
    primary: { main: "#e54520" },
    secondary: { main: "#252820" },
    background: { default: "#f2f0e9", paper: "#fffdf7" },
    text: { primary: "#252820", secondary: "#67695f", disabled: "#8b8d83" },
    divider: "#d4d4c7",
    dataVisualization: { totalArticles: "#e54520", totalChars: "#50766b" },
    success: { main: "#50766b" },
    error: { main: "#c13020" },
    warning: { main: "#906b16" },
    info: { main: "#50766b" },
  },
  components: {
    MuiLink: { styleOverrides: { root: { color: "inherit", textDecorationColor: "#e54520" } } },
    MuiAlert: { defaultProps: { variant: "outlined" }, styleOverrides: { root: { fontSize: 14, lineHeight: 1.5 } } },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 2, padding: "9px 18px" },
        contained: { backgroundColor: "#252820", color: "#fffdf7", "&:hover": { backgroundColor: "#e54520" } },
        outlined: {
          borderColor: "#252820",
          color: "#252820",
          "&:hover": { borderColor: "#e54520", backgroundColor: "#e5452010" },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiTab: { styleOverrides: { root: { fontWeight: 800, letterSpacing: "0.08em" } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 2, fontWeight: 700 } } },
    MuiDialog: { styleOverrides: { paper: { border: "1px solid #252820" } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: "#fffdf7" } } },
  },
})

export default theme
