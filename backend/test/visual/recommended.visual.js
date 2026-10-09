import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, openPage } from "./helpers"

async function mockRecommendations(page) {
  const response = await page.request.get("/api/app/articles")
  const { articles } = await response.json()
  const selected = [...articles, { ...articles[0], id: "third", title: "昔の記事との出会い" }]
  await page.context().route("**/api/app/recommended_articles", (route) => route.fulfill({ json: { articles: selected } }))
}

test("home recommended articles", async ({ page }) => {
  await mockRecommendations(page)
  await openPage(page, "/")
  await page.getByRole("tab", { name: "おすすめ" }).click()
  await expect(page.getByRole("button", { name: "再抽選" })).toBeEnabled()
  await expect(page.getByRole("heading", { name: "昔の記事との出会い" })).toBeVisible()
  await expectNoPageOverflow(page)
  await expect(page).toHaveScreenshot("home-recommended.png")
  await page.getByRole("button", { name: "再抽選" }).click()
  await expect(page.getByRole("button", { name: "再抽選" })).toBeEnabled()
})

test("home recommended loading", async ({ page }) => {
  await page.context().route("**/api/app/recommended_articles", () => {})
  await openPage(page, "/")
  await page.getByRole("tab", { name: "おすすめ" }).click()
  await expect(page.getByRole("status")).toHaveText("記事を読み込んでいます…")
  await expect(page.getByRole("button", { name: "再抽選" })).toBeDisabled()
  await expect(page).toHaveScreenshot("home-recommended-loading.png")
})

test("home recommended redraw error", async ({ page }) => {
  await mockRecommendations(page)
  await openPage(page, "/")
  await page.getByRole("tab", { name: "おすすめ" }).click()
  await expect(page.getByRole("button", { name: "再抽選" })).toBeEnabled()
  await page.context().route("**/api/app/recommended_articles", (route) => route.fulfill({ status: 504, json: { error: {} } }))
  await page.getByRole("button", { name: "再抽選" }).click()
  await expect(page.getByRole("button", { name: "再試行" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "昔の記事との出会い" })).toBeVisible()
  await expect(page).toHaveScreenshot("home-recommended-error.png")
})

test("home recommended empty", async ({ page }) => {
  await page.context().route("**/api/app/recommended_articles", (route) => route.fulfill({ json: { articles: [] } }))
  await openPage(page, "/")
  await page.getByRole("tab", { name: "おすすめ" }).click()
  await expect(page.getByText("記事がありません。")).toBeVisible()
  await expect(page).toHaveScreenshot("home-recommended-empty.png")
})
