import { useEffect, useMemo, useState } from "react"
import Box from "@mui/material/Box"
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

export default function Search({ articles = [] }) {
  const [query, setQuery] = useState(readInitialQuery)
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
          autoFocus
          onChange={setQuery}
          onClear={() => setQuery("")}
          query={query}
        />
        <Box sx={{ pt: 1 }}>
          {isSearching ? (
            <ArticlesList articles={filteredArticles} variant="divided" emptyMessage="該当する記事はありません。" />
          ) : (
            <Typography color="text.secondary">記事を検索</Typography>
          )}
        </Box>
      </PageContainer>
    </>
  )
}
