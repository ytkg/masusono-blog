export const adminArticles = [
  {
    id: "visual-published",
    title: "散歩の記録と寄り道で見つけたものをまとめた長い記事タイトル".repeat(3),
    status: "PUBLISH",
    updated_at: "2026-01-15T03:00:00Z",
  },
  { id: "visual-draft", title: "下書きの記事", status: "DRAFT", updated_at: "2026-01-14T03:00:00Z" },
  { id: "visual-revision", title: "", status: "PUBLISH_AND_DRAFT", updated_at: "2026-01-13T03:00:00Z" },
  { id: "visual-closed", title: "公開を終了した記事", status: "CLOSED", updated_at: "2026-01-12T03:00:00Z" },
]

export async function mockAdminArticles(page) {
  await page.route("**/api/app/management/articles?*", (route) => {
    const query = new URL(route.request().url()).searchParams.get("q") || ""
    const articles = adminArticles.filter((article) => article.title.includes(query))
    return route.fulfill({ json: { articles, total_count: articles.length, page: 1, has_more: false } })
  })
}
