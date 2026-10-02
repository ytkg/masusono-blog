import { parseArticleTags } from "./parseArticleTags"
import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"

export default function ArticleTags({ tags }) {
  const normalizedTags = parseArticleTags(tags)

  if (!normalizedTags.length) return null

  return (
    <Box data-testid="article-tags" sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
      {normalizedTags.map((tag) => (
        <Chip
          key={tag}
          component={Link}
          href={`/search?q=${encodeURIComponent(`#${tag}`)}`}
          label={`#${tag}`}
          size="small"
          variant="outlined"
          clickable
          sx={{ color: "text.secondary", borderColor: "divider" }}
        />
      ))}
    </Box>
  )
}
