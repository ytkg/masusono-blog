import { useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Typography from "@mui/material/Typography"
import ArticleSearchBox from "../features/blog/ArticleSearchBox"
import { articleMatchesQuery, normalizeArticleSearchText } from "../features/blog/articleSearch"
import ArticlesList from "../features/blog/ArticlesList"
import PageContainer from "../shared/PageContainer"
import SeoHead from "../shared/SeoHead"

function readInitialQuery() {
  if (typeof window === "undefined") {
    return ""
  }

  return new URLSearchParams(window.location.search).get("q") ?? ""
}

function writeQueryToUrl(query) {
  if (typeof window === "undefined") {
    return
  }

  const url = new URL(window.location.href)
  if (query.trim()) {
    url.searchParams.set("q", query)
  } else {
    url.searchParams.delete("q")
  }

  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`)
}

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

export default function Search({ articles = [] }) {
  const [query, setQuery] = useState(readInitialQuery)
  const [suggestedTags] = useState(() => extractArticleTags(articles))
  const [suggestedAuthors] = useState(() => extractArticleAuthors(articles))
  const normalizedQuery = normalizeArticleSearchText(query)
  const isSearching = Boolean(normalizedQuery)
  const filteredArticles = useMemo(
    () => articles.filter((article) => articleMatchesQuery(article, normalizedQuery)),
    [articles, normalizedQuery],
  )

  useEffect(() => {
    writeQueryToUrl(query)
  }, [query])

  return (
    <>
      <SeoHead
        title="検索"
        description="「増田とその他！」の記事を検索できます。"
        canonicalPath={isSearching ? `/search?q=${encodeURIComponent(query)}` : "/search"}
      />
      <PageContainer id="search" sx={{ pt: 0 }}>
        <ArticleSearchBox
          onChange={setQuery}
          onClear={() => setQuery("")}
          query={query}
        />
        <Box sx={{ pt: 1 }}>
          {isSearching ? (
            <ArticlesList articles={filteredArticles} variant="divided" emptyMessage="該当する記事はありません。" />
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {suggestedAuthors.length ? (
                <Box>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    著者から探す
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {suggestedAuthors.map((author) => (
                      <Chip
                        key={author}
                        label={`@${author}`}
                        onClick={() => setQuery(`@${author}`)}
                        size="small"
                        sx={{ color: "text.secondary", borderColor: "divider" }}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ) : null}
              {suggestedTags.length ? (
                <Box>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    タグから探す
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {suggestedTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        onClick={() => setQuery(`#${tag}`)}
                        size="small"
                        sx={{ color: "text.secondary", borderColor: "divider" }}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              ) : null}
            </Box>
          )}
        </Box>
      </PageContainer>
    </>
  )
}
