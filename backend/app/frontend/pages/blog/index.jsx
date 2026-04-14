import { useEffect, useMemo, useState } from "react"
import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"
import ArticlesList from "../../features/blog/ArticlesList"
import ArticleFilters from "../../features/blog/ArticleFilters"
import { DEFAULT_AUTHOR, filterArticles, getArticleAuthorOptions } from "../../features/blog/articleFilterUtils"
import SeoHead from "../../shared/SeoHead"

export default function Blog({ articles = [] }) {
  const [author, setAuthor] = useState(DEFAULT_AUTHOR)

  const authorOptions = useMemo(() => getArticleAuthorOptions(articles), [articles])
  const filteredArticles = useMemo(() => filterArticles({ articles, author }), [articles, author])
  const hasActiveFilters = author !== DEFAULT_AUTHOR

  useEffect(() => {
    if (author === DEFAULT_AUTHOR) {
      return
    }

    if (!authorOptions.some((option) => option.name === author)) {
      setAuthor(DEFAULT_AUTHOR)
    }
  }, [author, authorOptions])

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
            totalCount={articles.length}
            onAuthorChange={setAuthor}
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
