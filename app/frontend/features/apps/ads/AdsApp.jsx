import CampaignIcon from "@mui/icons-material/Campaign"
import Box from "@mui/material/Box"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"

export default function AdsApp() {
  return (
    <AppsDialogLauncher
      edgeToEdge
      title="広告（開発中）"
      launcherLabel="広告"
      buttonAriaLabel="広告を開く"
      buttonIcon={<CampaignIcon />}
      contentSx={{ display: "flex", minHeight: 0, overflow: "hidden" }}
    >
      <Box
        component="iframe"
        src="https://ads.masusono.com"
        title="広告（開発中）"
        sx={{ display: "block", width: "100%", height: "100%", border: 0 }}
      />
    </AppsDialogLauncher>
  )
}
