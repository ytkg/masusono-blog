const { test, expect } = require("@playwright/test")

test.describe("主要導線", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (typeof globalThis.crypto?.randomUUID === "function") {
        return
      }

      const randomUUID = () => {
        const suffix = Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)
        return `00000000-0000-4000-8000-${suffix}`
      }

      if (globalThis.crypto) {
        globalThis.crypto.randomUUID = randomUUID
        return
      }

      Object.defineProperty(globalThis, "crypto", {
        value: { randomUUID },
        configurable: true,
      })
    })
  })

  test("ホームで主要導線を表示する", async ({ page }) => {
    await page.goto("/")

    const main = page.getByRole("main")

    await expect(page.getByRole("heading", { name: "ようこそ" })).toBeVisible()
    await expect(main.getByRole("link", { name: "ブログ 最新の記事やお知らせはこちら" })).toBeVisible()
    await expect(main.getByRole("link", { name: "ポッドキャスト 番組のアーカイブを毎週更新" })).toBeVisible()
    await expect(main.getByRole("link", { name: "推し店 おすすめスポットをマップで紹介" })).toBeVisible()
    await expect(page.getByRole("button", { name: "増田RUNを開く" })).toBeVisible()
    await expect(page.getByRole("button", { name: "数字でわかる、増田とその他！を開く" })).toBeVisible()
    await expect(page.getByRole("button", { name: "設定を開く" })).toBeVisible()
  })

  test("ブログ一覧ページを表示できる", async ({ page }) => {
    await page.goto("/blog")

    await expect(page).toHaveTitle(/ブログ/)
    await expect(page.getByRole("heading", { name: "ブログ" })).toBeVisible()
    await expect(page.getByRole("link", { name: "E2E で確認する記事" })).toBeVisible()
    await expect(page.getByText("Playwright から確認するための本文です。")).toBeVisible()
  })

  test("ポッドキャスト一覧ページを表示できる", async ({ page }) => {
    await page.goto("/podcast")

    await expect(page).toHaveTitle(/ポッドキャスト/)
    await expect(page.getByRole("heading", { level: 1, name: "ポッドキャスト" })).toBeVisible()
    await expect(page.getByRole("link", { name: "E2E ポッドキャスト回" })).toBeVisible()
    await expect(page.getByRole("button", { name: "再生" })).toBeVisible()
  })

  test("推し店ページを表示できる", async ({ page }) => {
    await page.goto("/shop")

    await expect(page).toHaveTitle(/推し店/)
    await expect(page.getByRole("heading", { name: "推し店" })).toBeVisible()
    await expect(page.getByRole("button", { name: "遊飯家 酒舞 を選択" })).toBeVisible()
    await expect(page.getByRole("button", { name: "すべて" })).toBeVisible()
  })
})
