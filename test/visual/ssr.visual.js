import { expect, test } from "@playwright/test"
import { waitForClientReady } from "./helpers"

const pages = [
  ["/articles/visual-article-1", "駅を出て、いつもと違う道を歩きました。"],
  ["/articles/visual-article-2", "久しぶりに友人と集まりました。"],
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
      const imageUrl = await page.locator('meta[property="og:image"]').getAttribute("content")
      expect(imageUrl).toMatch(/^https:\/\/masusono.com\/articles\/[^/]+\/ogp\/[a-f0-9]{24}\.png$/)
      expect(imageUrl.startsWith(`https://masusono.com${path}/ogp/`)).toBe(true)
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", imageUrl)
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image")
      const image = await context.request.get(new URL(imageUrl).pathname)
      expect(image.status()).toBe(200)
      expect(image.headers()["content-type"]).toMatch(/^image\/png/)
      const bytes = await image.body()
      expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1200, 630])
    } finally {
      await context.close()
    }
  })
}

test("トップページの初回HTMLに説明文と記事一覧を含める", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  try {
    const page = await context.newPage()
    const response = await page.goto("/")
    expect(response.status()).toBe(200)
    await expect(page.locator("#app[data-server-rendered]")).toBeVisible()
    await expect(page.locator("head title")).toHaveCount(1)
    await expect(page.locator('meta[name="description"]')).toHaveCount(1)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "増田とその仲間たちが、日々の出来事や思ったことを気ままに綴る「増田とその他！」。日常のブログから、気軽に遊べるミニゲームまで。",
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://masusono.com/")
    await expect(page.getByRole("link", { name: "週末の散歩で見つけたもの", exact: true })).toBeVisible()
    await expect(page.locator("main")).toContainText("駅を出て、いつもと違う道を歩きました。")
  } finally {
    await context.close()
  }
})

for (const path of ["/authors", "/authors/visual-author-1", "/about"]) {
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
  await page.goto("/")
  await waitForClientReady(page)
  await expect(page.locator("#app[data-server-rendered]")).toBeVisible()
  await page.getByRole("tab", { name: "書き出し", exact: true }).click()
  await expect(page.getByRole("tab", { name: "書き出し", exact: true })).toHaveAttribute("aria-selected", "true")
  await page.getByRole("tab", { name: "フィード", exact: true }).click()
  await page.getByRole("link", { name: "週末の散歩で見つけたもの", exact: true }).click()
  await expect(page).toHaveURL(/\/articles\/visual-article-1$/)
  await page.reload()
  await waitForClientReady(page)
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

test("SSR stays unready until delayed layout JavaScript hydrates", async ({ page }) => {
  let release
  const layoutReady = new Promise((resolve) => {
    release = resolve
  })
  await page.route("**/vite/assets/AppLayout-*.js", async (route) => {
    await layoutReady
    await route.continue()
  })
  try {
    await page.goto("/")
    await expect(page.locator("#app[data-server-rendered]")).toBeVisible()
    await expect(page.locator("#app")).not.toHaveAttribute("data-client-ready", "true")
    release()
    await waitForClientReady(page)
    await page.getByRole("tab", { name: "書き出し", exact: true }).click()
    await expect(page.getByRole("tab", { name: "書き出し", exact: true })).toHaveAttribute("aria-selected", "true")
  } finally {
    release()
  }
})

test("native article links initialize history before returning home", async ({ page }) => {
  await page.goto("/articles/visual-article-2")
  await waitForClientReady(page)
  let release
  const layoutReady = new Promise((resolve) => {
    release = resolve
  })
  await page.route("**/vite/assets/AppLayout-*.js", async (route) => {
    await layoutReady
    await route.continue()
  })
  try {
    await page.getByRole("region", { name: "日常の記事" }).getByRole("link").click()
    await expect(page).toHaveURL(/\/articles\/visual-article-1$/)
    await expect(page.locator("#app")).not.toHaveAttribute("data-client-ready", "true")
    expect(await page.evaluate(() => history.state?.page?.url)).toBeUndefined()
    release()
    await waitForClientReady(page)
    await expect.poll(() => page.evaluate(() => history.state?.page?.url)).toBe("/articles/visual-article-1")
    await page.getByRole("link", { name: "ホーム", exact: true }).click()
    await expect(page).toHaveURL(/\/$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/articles\/visual-article-1$/)
    await expect(page.getByRole("heading", { name: "週末の散歩で見つけたもの" })).toBeVisible()
  } finally {
    release()
  }
})
