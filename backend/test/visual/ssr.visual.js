import { expect, test } from "@playwright/test"

const pages = [["/articles/visual-article-1", "駅を出て、いつもと違う道を歩きました。"]]

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

for (const path of ["/", "/authors", "/authors/visual-author-1", "/about"]) {
  test(`SSR対象外の初回HTML: ${path}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
    try {
      const page = await context.newPage()
      const response = await page.goto(path)
      expect(response.status()).toBe(200)
      await expect(page.locator("#app")).toBeAttached()
      await expect(page.locator("#app[data-server-rendered]")).toHaveCount(0)
      await expect(page.locator('script[data-page="app"]')).toHaveCount(1)
      await expect(page.locator("main")).toHaveCount(0)
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
  await page.goto("/articles/visual-article-1")
  await expect(page.locator("#app[data-server-rendered]")).toBeVisible()
  await page.getByRole("button", { name: "記事メニューを開く" }).click()
  await expect(page.getByRole("menu")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByRole("link", { name: "ホーム", exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
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
