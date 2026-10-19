import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  shape: { borderRadius: 12 },
  typography: {
    button: { textTransform: "none", fontWeight: 700 },
    fontFamily:
      "'M PLUS Rounded 1c', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'YuGothic', Meiryo, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  palette: {
    mode: "light",
    primary: { main: "#005ac1" },
    secondary: { main: "#666666" },
    background: { default: "#f5f5f7", paper: "#ffffff" },
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
      styleOverrides: {
        root: { minHeight: 44, paddingInline: 16 },
        contained: {
          backgroundColor: "#005ac1",
          color: "#fff",
          "&:hover": { backgroundColor: "#004a9f" },
        },
        outlined: {
          borderColor: "#005ac1",
          "&:hover": { borderColor: "#004a9f", backgroundColor: "#edf4ff" },
        },
      },
    },
  },
})

export default theme
