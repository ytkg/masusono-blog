import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  shape: { borderRadius: 8 },
  typography: {
    button: { textTransform: "none", fontWeight: 700 },
    fontFamily:
      "'M PLUS Rounded 1c', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'YuGothic', Meiryo, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  palette: {
    mode: "light",
    primary: { main: "#7045a0", dark: "#59367f" },
    action: { selected: "#f2edf8" },
    secondary: { main: "#666666" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#1d1d1f", secondary: "#666666", disabled: "#767680" },
    divider: "#dedee3",
    dataVisualization: { totalArticles: "#9966cc", totalChars: "#3399cc" },
    success: { main: "#000000" },
    error: { main: "#000000" },
    warning: { main: "#000000" },
    info: { main: "#000000" },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "inherit",
          textDecorationColor: "rgba(0,0,0,0.3)",
        },
      },
    },
    MuiAlert: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          fontSize: 14,
          lineHeight: 1.5,
          color: "#000",
          backgroundColor: "#fff",
          borderColor: "#e0e0e0",
        },
        outlined: {
          borderColor: "#e0e0e0",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, paddingInline: 16 },
      },
    },
  },
})

export default theme
