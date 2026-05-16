import { useEffect, useMemo, useRef, useState } from "react"
import Box from "@mui/material/Box"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import ArticleSearchBox from "../features/blog/ArticleSearchBox"
import { articleMatchesQuery, normalizeArticleSearchText } from "../features/blog/articleSearch"
import ArticlesList from "../features/blog/ArticlesList"
import PageContainer from "../shared/PageContainer"
import { TOGGLE_HOME_SEARCH_EVENT } from "../shared/homeSearchEvents"
import SeoHead from "../shared/SeoHead"

export default function Home({ articles = [] }) {
  const [query, setQuery] = useState("")
  const [searchVisible, setSearchVisible] = useState(false)
  const searchInputRef = useRef(null)
  const normalizedQuery = normalizeArticleSearchText(query)
  const isSearching = Boolean(normalizedQuery)
  const filteredArticles = useMemo(
    () => articles.filter((article) => articleMatchesQuery(article, normalizedQuery)),
    [articles, normalizedQuery],
  )

  useEffect(() => {
    ensureUserIdCookie()
  }, [])

  useEffect(() => {
    function toggleSearch() {
      setSearchVisible((current) => (current && normalizedQuery ? true : !current))
    }

    window.addEventListener(TOGGLE_HOME_SEARCH_EVENT, toggleSearch)
    return () => window.removeEventListener(TOGGLE_HOME_SEARCH_EVENT, toggleSearch)
  }, [normalizedQuery])

  useEffect(() => {
    if (searchVisible) {
      searchInputRef.current?.focus()
    }
  }, [searchVisible])

  return (
    <>
      <SeoHead
        title="ホーム"
        description="「増田とその他！」のブログ記事一覧。最近の出来事やお知らせ、コラムをまとめて読むことができます。"
        canonicalPath="/"
      />
      <PageContainer id="home">
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {searchVisible ? (
            <ArticleSearchBox
              inputRef={searchInputRef}
              isSearching={isSearching}
              onChange={setQuery}
              onClear={() => setQuery("")}
              query={query}
              resultCount={filteredArticles.length}
            />
          ) : null}
          <ArticlesList
            articles={filteredArticles}
            variant="divided"
            emptyMessage={isSearching ? "該当する記事はありません。" : undefined}
          />
        </Box>
      </PageContainer>
    </>
  )
}
