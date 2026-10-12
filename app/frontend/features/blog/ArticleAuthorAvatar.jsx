import { Link } from "@inertiajs/react"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"

export default function ArticleAuthorAvatar({ author, authorHref, avatarSrc, size = 48, sx }) {
  return (
    <Box
      component={authorHref ? Link : "div"}
      href={authorHref}
      aria-label={authorHref ? `${author}の著者ページへ` : undefined}
      sx={{
        display: "block",
        width: size,
        height: size,
        borderRadius: "50%",
        textDecoration: "none",
        "&:focus-visible": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: 2,
        },
        ...sx,
      }}
    >
      <Avatar
        src={avatarSrc}
        alt={author}
        sx={{
          width: size,
          height: size,
          boxSizing: "border-box",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "primary.light",
          color: "primary.contrastText",
          fontWeight: 700,
        }}
      >
        {author.charAt(0)}
      </Avatar>
    </Box>
  )
}
