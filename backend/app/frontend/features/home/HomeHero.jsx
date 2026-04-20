import { useMemo } from "react"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import masudaIconSrc from "./assets/aimi.webp"
import { masudaMessages } from "./masudaMessages"

const fallbackMasudaMessage = "今日も見に来てくれてありがとうございます。ゆっくりしていってください。"

function pickRandomMasudaMessage(messages) {
  if (messages.length === 0) return fallbackMasudaMessage

  return messages[Math.floor(Math.random() * messages.length)]
}

export default function HomeHero({ formattedNow }) {
  const masudaMessage = useMemo(() => pickRandomMasudaMessage(masudaMessages), [])

  return (
    <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        ようこそ
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {formattedNow}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        ブログやポッドキャスト、ちょっとしたゲームまで。最新のコンテンツをまとめてチェックできます。
      </Typography>
      <Box
        sx={{
          alignItems: "flex-end",
          alignSelf: "center",
          display: "flex",
          gap: { xs: 1.25, sm: 1.75 },
          maxWidth: 600,
          textAlign: "left",
          width: "100%",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 1,
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 2.5 },
            position: "relative",
            "&::before": {
              borderBottom: "8.25px solid transparent",
              borderLeft: "8.25px solid",
              borderLeftColor: "divider",
              borderTop: "8.25px solid transparent",
              content: '""',
              position: "absolute",
              right: -8.25,
              top: "50%",
              transform: "translateY(-50%)",
            },
            "&::after": {
              borderBottom: "7px solid transparent",
              borderLeft: "7px solid",
              borderLeftColor: "background.paper",
              borderTop: "7px solid transparent",
              content: '""',
              position: "absolute",
              right: -7,
              top: "50%",
              transform: "translateY(-50%)",
            },
          }}
        >
          <Typography variant="body1">{masudaMessage}</Typography>
        </Paper>
        <Box
          component="img"
          alt="増田のアイコン"
          src={masudaIconSrc}
          sx={{
            borderRadius: 0,
            flex: "0 0 auto",
            height: { xs: 64, sm: 72 },
            objectFit: "cover",
            width: { xs: 64, sm: 72 },
          }}
        />
      </Box>
    </Box>
  )
}
