import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import AuthorProfile from "./AuthorProfile"

const supportingLinkSx = { m: 0, fontSize: "12px", fontWeight: 700, letterSpacing: 0, lineHeight: 1.5 }

function AuthorListProfile({ member }) {
  return (
    <AuthorProfile
      author={member}
      component="div"
      data-testid="author-list-profile"
      headingComponent="h3"
      imageAlt={`${member.name}の人物像イラスト`}
      imageLoading="lazy"
      sx={{
        p: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderTop: "6px solid",
        borderTopColor: "primary.main",
        height: "100%",
      }}
    >
      <Box
        component={Link}
        href={`/authors/${member.id}`}
        sx={{
          ...supportingLinkSx,
          alignSelf: "flex-end",
          width: "fit-content",
          color: "text.secondary",
          textAlign: "right",
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {member.name}の記事を読む
      </Box>
    </AuthorProfile>
  )
}

export default function AuthorsList({ authors = [] }) {
  return (
    <Stack sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 3 }}>
      {authors.map((member) => (
        <AuthorListProfile key={member.id} member={member} />
      ))}
    </Stack>
  )
}
