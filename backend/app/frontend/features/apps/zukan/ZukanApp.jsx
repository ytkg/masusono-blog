import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import AppsDrawerLauncher from "../shared/AppsDrawerLauncher"
import { zukanEntries } from "./zukanData"

const labelTextSx = { m: 0, fontSize: "13px", fontWeight: 700, letterSpacing: 0, lineHeight: 1.4 }
const nameTextSx = { m: 0, fontWeight: 700, lineHeight: 1.25 }
const bioTextSx = { m: 0, lineHeight: 1.9, fontSize: { xs: "15px", sm: "16px" }, letterSpacing: 0 }
const noteTextSx = { fontSize: "13px", fontWeight: 700, letterSpacing: 0, lineHeight: 1.5 }
const historyToggleTextSx = { m: 0, fontSize: "13px", fontWeight: 700, letterSpacing: 0, lineHeight: 1.5 }
const historyLabelTextSx = { m: 0, fontSize: "12px", fontWeight: 700, letterSpacing: 0, lineHeight: 1.5 }
const historyBioTextSx = { m: 0, lineHeight: 1.8, fontSize: "14px", letterSpacing: 0 }
const imageSx = {
  width: { xs: 220, sm: 184 },
  aspectRatio: "1 / 1",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: "50%",
  bgcolor: "#fafafa",
  objectFit: "cover",
  display: "block",
  justifySelf: { xs: "center", sm: "start" },
  alignSelf: "start",
}

function ProfileHistory({ history }) {
  if (!history?.length) return null

  return (
    <Box component="details" sx={{ mt: 1.25, color: "text.secondary" }}>
      <Box
        component="summary"
        sx={{
          cursor: "pointer",
          listStyle: "none",
          display: "flex",
          justifyContent: "flex-end",
          "&::-webkit-details-marker": { display: "none" },
          "&::marker": { display: "none" },
        }}
      >
        <Typography variant="body2" sx={historyToggleTextSx}>
          過去のプロフィールを見る
        </Typography>
      </Box>
      <Stack spacing={1.25} sx={{ mt: 1.25 }}>
        {history.map((item) => (
          <Box key={`${item.label}-${item.title}`}>
            <Divider sx={{ mb: 1.25 }} />
            <Stack spacing={0.5}>
              <Typography variant="overline" color="text.secondary" sx={historyLabelTextSx}>
                {item.label}
              </Typography>
              <Typography variant="subtitle2" sx={{ m: 0, fontWeight: 700, lineHeight: 1.5 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={historyBioTextSx}>
                {item.bio}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function MemberProfile({ member }) {
  return (
    <Card variant="outlined">
      <CardContent
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "184px minmax(0, 1fr)" },
          gap: { xs: 1.75, sm: 2.5 },
          p: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
        }}
      >
        <Box component="img" src={member.image} alt={`${member.name}の人物像イラスト`} loading="lazy" sx={imageSx} />
        <Stack spacing={{ xs: 0.75, sm: 0.875 }} sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={labelTextSx}>
            {member.title}
          </Typography>
          <Typography variant="h5" component="h3" sx={nameTextSx}>
            {member.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={bioTextSx}>
            {member.bio}
          </Typography>
          <ProfileHistory history={member.history} />
        </Stack>
      </CardContent>
    </Card>
  )
}

export function ZukanTitleAccessory() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
      <AutoAwesomeIcon sx={{ fontSize: 17 }} />
      <Typography variant="body2" sx={noteTextSx}>
        AI分析による人物像
      </Typography>
    </Box>
  )
}

export function ZukanContent() {
  return (
    <Stack spacing={{ xs: 1.5, sm: 2 }}>
      {zukanEntries.map((member) => (
        <MemberProfile key={member.id} member={member} />
      ))}
    </Stack>
  )
}

export default function ZukanApp() {
  return (
    <AppsDrawerLauncher
      title="増その図鑑"
      launcherLabel="図鑑"
      buttonAriaLabel="増その図鑑を開く"
      buttonIcon={<CollectionsBookmarkIcon />}
      titleAccessory={<ZukanTitleAccessory />}
    >
      <ZukanContent />
    </AppsDrawerLauncher>
  )
}
