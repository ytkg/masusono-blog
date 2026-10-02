import { parseArticleTags } from "./parseArticleTags"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import SectionHeading from "@/shared/SectionHeading"

const READING_TIME_SUGGESTIONS = Object.freeze(
  [
    { label: "~1分", query: "read:1" },
    { label: "1~2分", query: "read:1-2" },
    { label: "2~3分", query: "read:2-3" },
    { label: "3~5分", query: "read:3-5" },
    { label: "5分~", query: "read:5+" },
  ].map(Object.freeze),
)

function extractArticleTags(articles) {
  const tags = new Set()
  articles.forEach((article) => {
    parseArticleTags(article.tags || "").forEach((tag) => tags.add(tag))
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
    <Box
      sx={{ p: 3, minHeight: 230, bgcolor: "background.paper", borderTop: "4px solid", borderColor: "text.primary" }}
    >
      <SectionHeading>{label}</SectionHeading>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {items.map((item) => {
          const itemLabel = typeof item === "string" ? `${prefix}${item}` : item.label
          const query = typeof item === "string" ? `${prefix}${item}` : item.query

          return (
            <Chip
              key={query}
              label={itemLabel}
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
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 3, py: 3 }}>
      <SearchSuggestionSection items={suggestedAuthors} label="著者から探す" prefix="@" onSelect={onSelect} />
      <SearchSuggestionSection items={suggestedTags} label="タグから探す" prefix="#" onSelect={onSelect} />
      <SearchSuggestionSection
        items={READING_TIME_SUGGESTIONS}
        label="読了目安から探す"
        prefix="read:"
        onSelect={onSelect}
      />
    </Box>
  )
}
