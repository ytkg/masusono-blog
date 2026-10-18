import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("ホームの追加読み込み・再試行・記事から戻った位置の復元", async ({ page, context }) => {
  const makeArticle = (index) => ({
    id: `paged-${index}`,
    title: `ページ記事${index}`,
    content: `<p>${"本文が続きます。".repeat(30)}</p>`,
    author: "著者",
    publishedDate: "2026/01/15",
  })
  const first = Array.from({ length: 10 }, (_, i) => makeArticle(i + 1))
  const next = Array.from({ length: 10 }, (_, i) => makeArticle(i + 11))
  next[9] = { ...next[9], id: "visual-article-2", title: "友人と食べた昼ごはん" }
  await mockPageProps(page, "/", (props) => {
    props.articles = first
    props.pagination = { nextOffset: 10 }
  })
  const prefetchReady = Promise.withResolvers()
  const releasePrefetch = Promise.withResolvers()
  await page.route((url) => url.pathname === "/", async (route) => {
    if (route.request().headers().purpose !== "prefetch") return route.fallback()
    const response = await route.fetch()
    prefetchReady.resolve()
    await releasePrefetch.promise
    await route.fulfill({ response })
  })
  let requests = 0
  await context.route("**/api/app/articles?offset=10", async (route) => {
    requests += 1
    if (requests === 1) {
      await route.fulfill({ status: 503, json: { error: { code: "upstream_error" } } })
    } else {
      await route.fulfill({ json: { articles: next, pagination: { nextOffset: null } } })
    }
  })

  await openPage(page, "/")
  await expect(page.locator("main h3")).toHaveCount(10)
  expect(requests).toBe(0)
  await page.getByRole("button", { name: "さらに読み込む" }).scrollIntoViewIfNeeded()
  await expect(page.getByText("記事を読み込めませんでした。")).toBeVisible()
  await expect(page.locator("main h3")).toHaveCount(10)
  expect(requests).toBe(1)
  await page.getByRole("button", { name: "再試行", exact: true }).click()
  await expect(page.locator("main h3")).toHaveCount(20)
  await expect(page.getByRole("button", { name: "さらに読み込む" })).toHaveCount(0)

  const articleLink = page.getByRole("link", { name: "友人と食べた昼ごはん", exact: true })
  await articleLink.scrollIntoViewIfNeeded()
  const scrollPosition = await page.evaluate(() => window.scrollY)
  await articleLink.click()
  await expect(page).toHaveURL(/\/articles\/visual-article-2$/)
  await expect(page.getByRole("heading", { name: "友人と食べた昼ごはん" })).toBeVisible()
  // Finish the home prefetch only after going back, reproducing the stale-response race.
  await prefetchReady.promise
  const cancelledPrefetch = page.waitForEvent("requestfailed", {
    predicate: (request) => new URL(request.url()).pathname === "/" && request.headers().purpose === "prefetch",
    timeout: 5000,
  })
  try {
    await page.goBack()
    await cancelledPrefetch
  } finally {
    releasePrefetch.resolve()
  }
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator("main h3")).toHaveCount(20)
  await expect
    .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - scrollPosition))
    .toBeLessThan(100)
  expect(requests).toBe(2)
})
