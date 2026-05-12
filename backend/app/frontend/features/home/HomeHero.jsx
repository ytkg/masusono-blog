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

export default function HomeHero() {
  const masudaMessage = useMemo(() => pickRandomMasudaMessage(masudaMessages), [])

  return (
    <Box sx={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          alignSelf: "center",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxWidth: 600,
          p: { xs: 2, sm: 2.5 },
          width: "100%",
        }}
      >
        <Box sx={{ textAlign: "left" }}>
          <Typography component="p" sx={{ lineHeight: 1.35 }}>
            <Box component="span" sx={{ fontSize: { xs: "1.22rem", sm: "1.32rem" } }}>
              ブログ
            </Box>
            や、
            <br />
            ちょっとした
            <Box component="span" sx={{ fontSize: { xs: "1.22rem", sm: "1.32rem" } }}>
              ゲーム
            </Box>
            まで。
          </Typography>
          <Typography color="text.secondary" component="p" sx={{ fontSize: "0.92rem", lineHeight: 1.7, mt: 0.5 }}>
            最新のコンテンツをまとめてチェックできます。
          </Typography>
        </Box>
        <Box
          sx={{
            alignItems: "flex-end",
            display: "flex",
            gap: { xs: 1.25, sm: 1.75 },
            textAlign: "left",
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
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
                top: "62%",
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
                top: "62%",
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
              height: { xs: 72, sm: 80 },
              mb: { xs: -2, sm: -2.5 },
              mr: { xs: -2, sm: -2.5 },
              objectFit: "cover",
              width: { xs: 72, sm: 80 },
            }}
          />
        </Box>
      </Paper>
    </Box>
  )
}
