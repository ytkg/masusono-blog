import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

import {
  labelTextSx,
  nameTextSx,
  bioTextSx,
  imageSx,
  profileGap,
  profileTextSpacing,
} from "../../../shared/authorProfileStyles"

const supportingLinkSx = { m: 0, fontSize: "12px", fontWeight: 700, letterSpacing: 0, lineHeight: 1.5 }

function MemberProfile({ member, isLast }) {
  const image = member.imageUrl

  return (
    <Box
      data-testid="zukan-member-profile"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: profileGap,
        pt: 2.5,
        pb: isLast ? 0 : 2.5,
        borderBottom: isLast ? "none" : "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      {image ? (
        <Box component="img" src={image} alt={`${member.name}の人物像イラスト`} loading="lazy" sx={imageSx} />
      ) : null}
      <Stack spacing={profileTextSpacing} sx={{ minWidth: 0, maxWidth: 640 }}>
        <Typography variant="overline" color="text.secondary" sx={labelTextSx}>
          {member.title}
        </Typography>
        <Typography variant="h5" component="h3" sx={nameTextSx}>
          {member.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ ...bioTextSx, textAlign: "left" }}>
          {member.bio}
        </Typography>
        <Box
          component={Link}
          href={`/authors/${member.id}`}
          sx={{
            ...supportingLinkSx,
            color: "text.secondary",
            textAlign: "right",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {member.name}の記事を読む
        </Box>
      </Stack>
    </Box>
  )
}

export function ZukanContent({ authors = [] }) {
  return (
    <Stack>
      {authors.map((member, index) => (
        <MemberProfile key={member.id} member={member} isLast={index === authors.length - 1} />
      ))}
    </Stack>
  )
}
