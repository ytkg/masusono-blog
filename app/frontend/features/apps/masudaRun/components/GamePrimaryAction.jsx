import Box from "@mui/material/Box"
import Button from "@mui/material/Button"

const BUTTON_LABELS = Object.freeze({
  ready: "スタート",
  playing: "ジャンプ",
  gameover: "リスタート",
})

export default function GamePrimaryAction({ state, restartCooling, onAction }) {
  return (
    <Box sx={{ width: "100%", flexShrink: 0 }}>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        disableRipple
        disabled={restartCooling}
        onPointerDown={(e) => {
          if (e.button > 0) return
          e.preventDefault()
          onAction()
        }}
        onClick={(e) => {
          e.preventDefault()
          if (e.detail !== 0) return
          onAction()
        }}
      >
        {BUTTON_LABELS[state]}
      </Button>
    </Box>
  )
}
