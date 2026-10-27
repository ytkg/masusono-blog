import { requestJson } from "@/shared/lib/fetchJson"

export async function fetchCalendarGroups({ signal }) {
  const result = await requestJson("/api/app/calendar_articles", { signal })
  if (
    !Array.isArray(result?.groups) ||
    result.groups.some(
      (group) =>
        typeof group?.monthDay !== "string" || !/^\d{2}\/\d{2}$/.test(group.monthDay) || !Array.isArray(group.articles),
    )
  )
    throw new Error("Invalid calendar articles")
  return result.groups
}

export async function fetchSentenceArticles({ signal }) {
  const result = await requestJson("/api/app/sentence_articles", { signal })
  if (
    !Array.isArray(result?.articles) ||
    result.articles.some((article) => typeof article?.id !== "string" || typeof article.content !== "string")
  )
    throw new Error("Invalid sentence articles")
  return result.articles
}
