import { expect, test } from "@playwright/test"

const pages = [
  ["/", "週末の散歩で見つけたもの"],
  ["/articles/visual-article-1", "駅を出て、いつもと違う道を歩きました。"],
  ["/authors", "増田愛美"],
  ["/authors/visual-author-1", "散歩と食事が好きです。"],
  ["/about", "飲み仲間3人"],
]

for (const [path, text] of pages) {
  test(`SSR初回HTML: ${path}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
    try {
      const page = await context.newPage()
      const response = await page.goto(path)
      expect(response.status()).toBe(200)
      await expect(page.locator("#app[data-server-rendered]")).toBeVisible()
      await expect(page.locator("main")).toContainText(text)
      await expect(page.locator("head title")).toHaveCount(1)
      await expect(page.locator('meta[name="description"]')).toHaveCount(1)
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://masusono.com${path}`)
      await expect(page.locator("main a[href]").first()).toBeVisible()
    } finally {
      await context.close()
    }
  })
}

test("SSRのhydrationとInertia遷移後も操作できる", async ({ page }) => {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|hydrating|didn't match|Minified React error/i.test(message.text()))
      errors.push(message.text())
  })
  await page.goto("/")
  await expect(page.locator("#app[data-server-rendered]")).toBeVisible()
  await page.getByRole("tab", { name: "書き出し", exact: true }).click()
  await expect(page.getByRole("tab", { name: "書き出し", exact: true })).toHaveAttribute("aria-selected", "true")
  await page.getByRole("tab", { name: "フィード", exact: true }).click()
  await page.getByRole("link", { name: "週末の散歩で見つけたもの", exact: true }).click()
  await expect(page).toHaveURL(/\/articles\/visual-article-1$/)
  await expect(page.locator("head title")).toHaveCount(1)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://masusono.com/articles/visual-article-1",
  )
  await expect(page.getByRole("heading", { name: "週末の散歩で見つけたもの" })).toBeVisible()
  expect(errors).toEqual([])
})
