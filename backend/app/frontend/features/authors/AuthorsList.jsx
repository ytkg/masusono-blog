import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import AuthorProfile from "./AuthorProfile"

const supportingLinkSx = { m: 0, fontSize: "12px", fontWeight: 700, letterSpacing: 0, lineHeight: 1.5 }

function AuthorListProfile({ member, isLast }) {
  return (
    <AuthorProfile
      author={member}
      component="div"
      data-testid="author-list-profile"
      headingComponent="h3"
      imageAlt={`${member.name}の人物像イラスト`}
      imageLoading="lazy"
      sx={{ pt: 2.5, pb: isLast ? 0 : 2.5, borderBottom: isLast ? "none" : "1px solid", borderColor: "divider" }}
    >
      <Box
        component={Link}
        href={`/authors/${member.id}`}
        sx={{
          ...supportingLinkSx,
          alignSelf: "flex-end",
          color: "text.secondary",
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
    <Stack>
      {authors.map((member, index) => (
        <AuthorListProfile key={member.id} member={member} isLast={index === authors.length - 1} />
      ))}
    </Stack>
  )
}
