import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import HighlightedCode from "./HighlightedCode"

const monoFont = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"

const shellSx = {
  bgcolor: "#f7f7f7",
  borderRadius: 2,
  color: "text.primary",
  display: "grid",
  fontFamily: monoFont,
  fontSize: "0.875rem",
  lineHeight: 1.7,
  mb: "1em",
  overflow: "hidden",
}

const headerSx = {
  alignItems: "center",
  backgroundColor: "#f7f7f7",
  display: "flex",
  justifyContent: "space-between",
  minHeight: "2rem",
  px: 1.5,
  py: "0.6rem",
}

const labelSx = {
  color: "text.secondary",
  fontFamily:
    "'M PLUS Rounded 1c', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'YuGothic', Meiryo, system-ui, sans-serif",
  fontSize: "11px",
  fontWeight: 700,
  lineHeight: 1,
}

const bodySx = {
  px: 0,
  pb: 1.5,
}

const scrollerSx = {
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
}

const runButtonSx = {
  color: "text.secondary",
  fontSize: "11px",
  fontWeight: 700,
  minWidth: 0,
  px: 0.5,
  py: 0,
  "&:hover": { bgcolor: "transparent", color: "text.primary" },
}

export default function CodeBlock({ block, action }) {
  return (
    <Box data-code-block-shell sx={shellSx}>
      <Box data-code-block-header sx={headerSx}>
        <Box component="span" data-code-language-label sx={labelSx}>
          {block.languageLabel}
        </Box>
        {action}
      </Box>
      <Box sx={{ ...bodySx, ...scrollerSx }}>
        <HighlightedCode block={block} />
      </Box>
    </Box>
  )
}

export function CodeBlockRunButton({ disabled, isRunning, onClick }) {
  return (
    <Button disabled={disabled} onClick={onClick} size="small" variant="text" sx={runButtonSx}>
      {isRunning ? "実行中" : "▶ 実行"}
    </Button>
  )
}
