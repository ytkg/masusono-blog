import useArticles from "./useArticles"

export default function useArticle(articleId) {
  const { articles, error, isLoading } = useArticles()
  const article = articles.find((item) => item.id === articleId) ?? null

  return {
    article,
    error,
    isLoading,
  }
}
