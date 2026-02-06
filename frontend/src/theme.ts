import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  typography: {
    fontFamily:
      "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'YuGothic', Meiryo, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  palette: {
    mode: "light",
    primary: { main: "#000000" },
    secondary: { main: "#666666" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "#000000", secondary: "#666666", disabled: "#9e9e9e" },
    divider: "#e0e0e0",
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
        root: { color: "#000" },
        contained: {
          backgroundColor: "#000",
          color: "#fff",
          "&:hover": { backgroundColor: "#222" },
        },
        outlined: {
          borderColor: "#000",
          "&:hover": { borderColor: "#222", backgroundColor: "#f5f5f5" },
        },
      },
    },
  },
})

export default theme
