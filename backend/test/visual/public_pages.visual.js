import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let seed = 12345
    Math.random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
  })
})

async function openPage(page, path, status = 200) {
  const response = await page.goto(path)
  expect(response?.status()).toBe(status)
  await page.locator("main").waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page
    .locator("img:visible")
    .evaluateAll((images) => Promise.all(images.map((image) => image.decode().catch(() => {}))))
}

async function screenshot(page, name) {
  await expect(page).toHaveScreenshot(`${name}.png`)
}

test("home feed", async ({ page }) => {
  await openPage(page, "/")
  await expect(page.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
  await screenshot(page, "home-feed")
})

test("home beginnings", async ({ page }) => {
  await openPage(page, "/")
  await page.getByRole("tab", { name: "書き出し" }).click()
  await expect(page.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "true")
  await expect(page.locator(".sentence-card").first()).toBeVisible()
  await screenshot(page, "home-beginnings")
})

for (const [name, path, heading] of [
  ["about", "/about", "「増田とその他！」について"],
  ["others", "/others", "増田とその他のその他！"],
  ["authors", "/authors", "著者"],
  ["author-detail", "/authors/visual-author-1", "増田愛美"],
  ["numbers", "/numbers", "数字でわかる、増田とその他！"],
  ["article-detail", "/articles/visual-article-1", "週末の散歩で見つけたもの"],
]) {
  test(name, async ({ page }) => {
    await openPage(page, path)
    await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible()
    await screenshot(page, name)
  })
}

test("search suggestions", async ({ page }) => {
  await openPage(page, "/search")
  await expect(page.getByText("著者から探す")).toBeVisible()
  await screenshot(page, "search-suggestions")
})

test("search results", async ({ page }) => {
  await openPage(page, "/search?q=散歩")
  await expect(page.getByRole("link", { name: "週末の散歩で見つけたもの" })).toBeVisible()
  await screenshot(page, "search-results")
})

for (const [name, button] of [
  ["masuda-run", "増田RUNを開く"],
  ["settings", "設定を開く"],
]) {
  test(name, async ({ page }) => {
    await openPage(page, "/others")
    await page.getByRole("button", { name: button }).click()
    await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
    await screenshot(page, name)
  })
}

test("not found", async ({ page }) => {
  await openPage(page, "/articles/visual-missing", 404)
  await expect(page.getByRole("heading", { name: "ページが見つかりません" })).toBeVisible()
  await screenshot(page, "not-found")
})
