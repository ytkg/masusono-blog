import useSWR from "swr"
import { fetchJson } from "../../../shared/lib/fetchJson"

const ARTICLES_ENDPOINT = "/api/blog/articles.json"

export default function useArticles() {
  const { data, error, isLoading } = useSWR(ARTICLES_ENDPOINT, fetchJson)
  const articles = Array.isArray(data?.articles) ? data.articles : []

  return {
    articles,
    error,
    isLoading,
  }
}
