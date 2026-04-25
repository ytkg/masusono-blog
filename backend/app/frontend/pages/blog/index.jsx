import { useEffect, useMemo, useState } from "react"
import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"
import ArticlesList from "../../features/blog/ArticlesList"
import ArticleFilters from "../../features/blog/ArticleFilters"
import {
  DEFAULT_AUTHOR,
  DEFAULT_YEAR_MONTH,
  filterArticles,
  getArticleAuthorOptions,
  getArticleYearMonthOptions,
} from "../../features/blog/articleFilterUtils"
import SeoHead from "../../shared/SeoHead"

export default function Blog({ articles = [] }) {
  const [author, setAuthor] = useState(DEFAULT_AUTHOR)
  const [yearMonth, setYearMonth] = useState(DEFAULT_YEAR_MONTH)

  const authorFilteredArticles = useMemo(() => filterArticles({ articles, author }), [articles, author])
  const yearMonthFilteredArticles = useMemo(() => filterArticles({ articles, yearMonth }), [articles, yearMonth])
  const authorOptions = useMemo(
    () => getArticleAuthorOptions(articles, yearMonthFilteredArticles),
    [articles, yearMonthFilteredArticles],
  )
  const yearMonthOptions = useMemo(
    () => getArticleYearMonthOptions(articles, authorFilteredArticles),
    [articles, authorFilteredArticles],
  )
  const filteredArticles = useMemo(() => filterArticles({ articles, author, yearMonth }), [articles, author, yearMonth])
  const hasActiveFilters = author !== DEFAULT_AUTHOR || yearMonth !== DEFAULT_YEAR_MONTH

  useEffect(() => {
    if (author === DEFAULT_AUTHOR) {
      return
    }

    if (!authorOptions.some((option) => option.name === author)) {
      setAuthor(DEFAULT_AUTHOR)
    }
  }, [author, authorOptions])

  useEffect(() => {
    if (yearMonth === DEFAULT_YEAR_MONTH) {
      return
    }

    if (!yearMonthOptions.some((option) => option.yearMonth === yearMonth)) {
      setYearMonth(DEFAULT_YEAR_MONTH)
    }
  }, [yearMonth, yearMonthOptions])

  return (
    <>
      <SeoHead
        title="ブログ"
        description="「増田とその他！」のブログ記事一覧。最近の出来事やお知らせ、コラムをまとめて読むことができます。"
        canonicalPath="/blog"
      />

      <PageContainer id="blog" sx={{ pb: 10 }}>
        <SectionHeading component="h1">ブログ</SectionHeading>
        {articles.length ? (
          <ArticleFilters
            author={author}
            authorOptions={authorOptions}
            yearMonth={yearMonth}
            yearMonthOptions={yearMonthOptions}
            authorTotalCount={yearMonthFilteredArticles.length}
            yearMonthTotalCount={authorFilteredArticles.length}
            onAuthorChange={setAuthor}
            onYearMonthChange={setYearMonth}
          />
        ) : null}
        <ArticlesList
          articles={filteredArticles}
          emptyMessage={hasActiveFilters ? "条件に一致する記事がありません。" : "記事がありません。"}
        />
      </PageContainer>
    </>
  )
}
