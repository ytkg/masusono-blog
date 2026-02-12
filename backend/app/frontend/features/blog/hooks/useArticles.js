import useSWR from "swr"

const ARTICLES_ENDPOINT = "/api/blog/articles.json"

const fetcher = async (url) => {
  const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } })
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`)
  }
  return response.json()
}

export default function useArticles() {
  const { data, error, isLoading } = useSWR(ARTICLES_ENDPOINT, fetcher)
  const articles = Array.isArray(data?.articles) ? data.articles : []

  return {
    articles,
    error,
    isLoading,
  }
}
