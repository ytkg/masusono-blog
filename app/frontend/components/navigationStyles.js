import {
  HEADER_HEIGHT,
  HEADER_TOOLBAR_HEIGHT,
  PAGE_MAX_WIDTH,
  PAGE_HORIZONTAL_PADDING,
  NAVIGATION_CONTENT_HEIGHT,
  NAVIGATION_VERTICAL_PADDING,
  NAVIGATION_BORDER_WIDTH,
  navigationBottomSx,
  PAGE_INNER_MAX_WIDTH,
} from "../layouts/pageLayout"

const NAVIGATION_LABEL_FONT_SIZE = "0.72rem"

export const navigationPaperSx = {
  position: "fixed",
  left: "50%",
  bottom: navigationBottomSx,
  transform: "translateX(-50%)",
  width: { xs: "calc(100% - 32px)", sm: "calc(100% - 48px)" },
  maxWidth: PAGE_INNER_MAX_WIDTH,
  zIndex: (t) => t.zIndex.appBar,
  overflow: "hidden",
  bgcolor: "common.white",
  color: "text.primary",
  border: `${NAVIGATION_BORDER_WIDTH}px solid`,
  borderColor: "divider",
  borderRadius: 999,
  boxShadow: "0 8px 32px rgba(29, 29, 31, 0.12)",
  px: { xs: 1, sm: 1.25 },
  py: `${NAVIGATION_VERTICAL_PADDING}px`,
}

export function buildBottomNavigationSx() {
  return {
    width: "100%",
    maxWidth: "100%",
    height: NAVIGATION_CONTENT_HEIGHT,
    position: "relative",
    bgcolor: "transparent",
    overflowX: "auto",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    ".MuiBottomNavigationAction-root": {
      minWidth: 0,
      flex: "1 1 0",
      position: "relative",
      px: { xs: 1, sm: 1.25 },
      mx: 0.25,
      borderRadius: 999,
      color: "text.secondary",
      "&.Mui-selected": {
        color: "primary.main",
        bgcolor: "#edf4ff",
      },
    },
    ".MuiSvgIcon-root": {
      fontSize: 22,
    },
    ".MuiBottomNavigationAction-label": {
      whiteSpace: "nowrap",
      fontSize: NAVIGATION_LABEL_FONT_SIZE,
      "&.Mui-selected": {
        fontSize: NAVIGATION_LABEL_FONT_SIZE,
        fontWeight: 700,
      },
    },
  }
}

export const headerSx = {
  minHeight: HEADER_HEIGHT,
  py: 0,
  bgcolor: "background.paper",
  color: "text.primary",
  boxShadow: "none",
  borderBottom: "1px solid",
  borderColor: "divider",
}

export const headerToolbarSx = {
  alignItems: "flex-end",
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  minHeight: HEADER_TOOLBAR_HEIGHT,
  pt: 0,
  pb: { xs: 0.5, sm: 0.75 },
  px: PAGE_HORIZONTAL_PADDING,
  width: "100%",
  maxWidth: PAGE_MAX_WIDTH,
  mx: "auto",
}

export const headerLogoLinkSx = {
  display: "inline-flex",
  alignItems: "flex-end",
  gridColumn: 2,
  textDecoration: "none",
  perspective: "800px",
}

export const headerLogoImageSx = {
  height: { xs: 40, sm: 48 },
  maxWidth: "100%",
  objectFit: "contain",
}

export const headerBackButtonSx = {
  alignSelf: "center",
  color: "text.secondary",
  gridColumn: 1,
  gridRow: 1,
  justifySelf: "start",
  transform: "translateY(2px)",
}
