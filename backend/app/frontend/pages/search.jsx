import { useMemo } from "react"
import Box from "@mui/material/Box"
import ArticleSearchBox from "../features/blog/ArticleSearchBox"
import ArticleSearchSuggestions from "../features/blog/ArticleSearchSuggestions"
import { articleMatchesQuery, normalizeArticleSearchText } from "../features/blog/articleSearch"
import ArticlesList from "../features/blog/ArticlesList"
import useArticleSearchQuery from "../features/blog/useArticleSearchQuery"
import PageContainer from "../shared/PageContainer"
import SeoHead from "../shared/SeoHead"

export default function Search({ articles = [] }) {
  const [query, setQuery] = useArticleSearchQuery()
  const normalizedQuery = normalizeArticleSearchText(query)
  const isSearching = Boolean(normalizedQuery)
  const filteredArticles = useMemo(
    () => articles.filter((article) => articleMatchesQuery(article, normalizedQuery)),
    [articles, normalizedQuery],
  )

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
            <ArticleSearchSuggestions articles={articles} onSelect={setQuery} />
          )}
        </Box>
      </PageContainer>
    </>
  )
}
