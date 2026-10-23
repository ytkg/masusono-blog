import { useState } from "react"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import CampaignIcon from "@mui/icons-material/Campaign"
import Box from "@mui/material/Box"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"

export default function AdsApp() {
  const [userId, setUserId] = useState(null)

  return (
    <AppsDialogLauncher
      onOpen={() => setUserId(ensureUserIdCookie())}
      edgeToEdge
      title="広告"
      launcherLabel="広告"
      buttonAriaLabel="広告を開く"
      buttonIcon={<CampaignIcon />}
      contentSx={{ display: "flex", minHeight: 0, overflow: "hidden" }}
    >
      {userId ? (
        <Box
          component="iframe"
          src={`https://ads.masusono.com/users/${encodeURIComponent(userId)}/ads`}
          title="広告"
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
