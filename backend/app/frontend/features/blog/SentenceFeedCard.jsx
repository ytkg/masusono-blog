import { focusRingSx } from "../../shared/focusStyles"
import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import { SENTENCE_REVEAL_DURATION_MS } from "./sentenceFeedData"

const CARD_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "absolute",
  top: 0,
  left: 0,
  p: { xs: "0.32rem 0.22rem", sm: "0.38rem 0.28rem" },
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  color: "text.primary",
  textDecoration: "none",
  WebkitTapHighlightColor: "transparent",
  transition: "background-color 120ms ease, border-color 120ms ease",
  "@media (hover: hover)": {
    "&:hover": { borderColor: "text.primary", bgcolor: "background.default" },
  },
  "&:focus-visible": {
    borderColor: "text.primary",
    bgcolor: "background.default",
    ...focusRingSx,
  },
  "&:active": { borderColor: "text.primary", bgcolor: "#f5f5f5" },
  "@keyframes sentence-reveal": { to: { opacity: 1, filter: "blur(0)" } },
  "@media (prefers-reduced-motion: reduce)": { animation: "none", filter: "none", opacity: 1 },
}

function fontSizeFor(length) {
  if (length <= 5) return "1.82rem"
  if (length <= 12) return "1.56rem"
  if (length <= 20) return "1.34rem"
  if (length <= 32) return "1.12rem"
  if (length <= 50) return "0.98rem"

  return "0.88rem"
}

export default function SentenceFeedCard({ article, hasRevealed, sentence, revealDelay }) {
  return (
    <Box
      component={Link}
      className="sentence-card"
      href={`/articles/${article.id}`}
      sx={{
        ...CARD_SX,
        opacity: hasRevealed ? 1 : 0,
        filter: hasRevealed ? "none" : "blur(5px)",
        animation: hasRevealed ? "none" : `sentence-reveal ${SENTENCE_REVEAL_DURATION_MS}ms ease forwards`,
        animationDelay: `${revealDelay}ms`,
      }}
    >
      <Box
        component="span"
        sx={{
          writingMode: "vertical-rl",
          textOrientation: "upright",
          fontFamily: '"Yu Mincho", "YuMincho", "Hiragino Mincho ProN", "Hiragino Mincho Pro", "Noto Serif JP", serif',
          fontSize: fontSizeFor(sentence.length),
          lineHeight: { xs: 1.75, sm: 1.95 },
          letterSpacing: "0.07em",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {sentence}
      </Box>
    </Box>
  )
}
