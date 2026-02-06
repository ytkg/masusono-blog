import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import PageContainer from "./PageContainer"
// import Alert from '@mui/material/Alert'
import Aimi from "./Aimi"
import { usePageMeta } from "../hooks/usePageMeta"

export default function Podcast() {
  usePageMeta({
    title: "ポッドキャスト",
    description: "増田とその他！のポッドキャスト情報。番組のアーカイブや最新エピソードをお届けします（準備中）。",
    canonicalPath: "/podcast",
  })

  return (
    <PageContainer id="podcast">
      <Typography variant="h5" component="h1" gutterBottom>
        ポッドキャスト
      </Typography>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "flex-end",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          pt: { xs: 1.5, sm: 2 },
          pl: { xs: 1.5, sm: 2 },
          pr: 0,
          pb: 0,
          bgcolor: "background.paper",
          overflow: "visible",
        }}
      >
        <Box sx={{ position: "relative", display: "inline-block", zIndex: 1 }}>
          {/* 吹き出し（Aimi の左側） */}
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: "calc(100% + 8px)",
              bgcolor: "background.paper",
              color: "text.primary",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
              fontSize: "0.875rem",
              boxShadow: 1,
              whiteSpace: "nowrap",
              zIndex: 2,
              "::before": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "100%",
                transform: "translateY(-50%)",
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                borderLeft: "7px solid",
                borderLeftColor: "divider",
              },
              "::after": {
                content: '""',
                position: "absolute",
                top: "50%",
                left: "100%",
                transform: "translateY(-50%) translateX(-1px)",
                borderTop: "6px solid transparent",
                borderBottom: "6px solid transparent",
                borderLeft: "6px solid",
                borderLeftColor: "background.paper",
              },
            }}
          >
            準備中だよ
          </Box>
          <Aimi />
        </Box>
      </Box>
    </PageContainer>
  )
}
