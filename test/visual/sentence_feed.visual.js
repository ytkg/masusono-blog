import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test("home beginnings pagination does not repeat while loading or after a failure", async ({ page, context }) => {
  const articles = Array.from({ length: 20 }, (_, index) => ({
    id: `pagination-article-${index}`,
    title: `記事${index}`,
    content: `<p>記事${index}の書き出し。</p>`,
  }))
  await mockPageProps(page, "/", (props) => {
    props.articles = articles.slice(0, 10)
    props.pagination = { nextOffset: 10 }
  })
  let releasePage
  const pageReady = new Promise((resolve) => {
    releasePage = resolve
  })
  // Intercept the service worker's forwarded API requests as well.
  await context.route("**/api/app/articles?offset=*", async (route) => {
    if (new URL(route.request().url()).searchParams.get("offset") !== "10") {
      await route.fulfill({ status: 500, json: { error: "unavailable" } })
      return
    }
    await pageReady
    await route.fulfill({ json: { articles: articles.slice(10), pagination: { nextOffset: 20 } } })
  })
  try {
    await openPage(page, "/")
    await page.getByRole("tab", { name: "書き出し" }).click()
    const cards = page.locator(".sentence-card")
    await expect(cards).toHaveCount(10)
    await expect(cards.first()).toBeVisible()
    const firstIds = await cards.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")))
    expect(new Set(firstIds).size).toBe(10)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect(page.getByText("記事を読み込んでいます…")).toBeVisible()
    await expect(cards).toHaveCount(10)
    releasePage()
    await expect(cards).toHaveCount(20)
    const allIds = await cards.evaluateAll((elements) => elements.map((element) => element.getAttribute("href")))
    expect(new Set(allIds).size).toBe(20)
    expect(allIds.slice(0, 10)).toEqual(firstIds)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expect(page.getByText("記事を読み込めませんでした。")).toBeVisible()
    await expect(cards).toHaveCount(20)
  } finally {
    releasePage()
  }
})

