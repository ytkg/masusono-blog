import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const headerSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: 1,
  pb: 0.25,
}

const scoreTextSx = { fontSize: 16 }

const SCORE_PAD = 5

export default function GameScoreboard({ score, high }) {
  return (
    <Box sx={headerSx}>
      <Typography variant="body2" sx={scoreTextSx}>
        スコア {score.toString().padStart(SCORE_PAD, "0")}
      </Typography>
      <Typography variant="body2" sx={scoreTextSx}>
        ハイスコア {Math.max(high, score).toString().padStart(SCORE_PAD, "0")}
      </Typography>
    </Box>
  )
}
