import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Typography from "@mui/material/Typography"

function extractArticleTags(articles) {
  const tags = new Set()
  articles.forEach((article) => {
    String(article.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .forEach((tag) => tags.add(tag))
  })

  return Array.from(tags)
}

function extractArticleAuthors(articles) {
  const authors = new Set()
  articles.forEach((article) => {
    const author = String(article.author || "").trim()
    if (author) authors.add(author)
  })

  return Array.from(authors)
}

function SearchSuggestionSection({ items, label, prefix, onSelect }) {
  if (!items.length) return null

  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {items.map((item) => {
          const query = `${prefix}${item}`

          return (
            <Chip
              key={item}
              label={query}
              onClick={() => onSelect(query)}
              size="small"
              sx={{ color: "text.secondary", borderColor: "divider" }}
              variant="outlined"
            />
          )
        })}
      </Box>
    </Box>
  )
}

export default function ArticleSearchSuggestions({ articles, onSelect }) {
  const suggestedAuthors = extractArticleAuthors(articles)
  const suggestedTags = extractArticleTags(articles)

  return (
    <Box sx={{ display: "grid", gap: 1.5 }}>
      <SearchSuggestionSection items={suggestedAuthors} label="著者から探す" prefix="@" onSelect={onSelect} />
      <SearchSuggestionSection items={suggestedTags} label="タグから探す" prefix="#" onSelect={onSelect} />
    </Box>
  )
}
