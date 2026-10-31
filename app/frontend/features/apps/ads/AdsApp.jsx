import { useState } from "react"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import CampaignIcon from "@mui/icons-material/Campaign"
import Box from "@mui/material/Box"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"

export default function AdsApp({ articleId, renderLauncher }) {
  const [userId, setUserId] = useState(null)
  const title = articleId ? "広告を出稿する" : "広告"

  return (
    <AppsDialogLauncher
      onOpen={() => setUserId(ensureUserIdCookie())}
      renderLauncher={renderLauncher}
      edgeToEdge
      title={title}
      launcherLabel="広告"
      buttonAriaLabel="広告を開く"
      buttonIcon={<CampaignIcon />}
      contentSx={{ display: "flex", minHeight: 0, overflow: "hidden" }}
    >
      {userId ? (
        <Box
          component="iframe"
          src={`https://ads.masusono.com/users/${encodeURIComponent(userId)}/ads${articleId ? `/new?articleId=${encodeURIComponent(articleId)}` : ""}`}
          title={title}
          sx={{ display: "block", width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <Box role="status" sx={{ p: 2 }}>
          広告を表示できません。ブラウザのCookie設定を確認してください。
        </Box>
      )}
    </AppsDialogLauncher>
  )
}
