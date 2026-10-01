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
    if (name === "others") {
      for (const button of ["増田RUNを開く", "設定を開く", "管理を開く"]) {
        await expect(page.getByRole("button", { name: button })).toBeVisible()
      }
    }
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
    if (name === "masuda-run") {
      const rankings = page.getByRole("table", { name: "増田RUNランキング" })
      await expect(rankings).toBeVisible()
      await expect(rankings.getByRole("row", { name: /増田愛美/ })).toBeVisible()
    }
    await screenshot(page, name)
  })
}

test("not found", async ({ page }) => {
  await openPage(page, "/articles/visual-missing", 404)
  await expect(page.getByRole("heading", { name: "ページが見つかりません" })).toBeVisible()
  await screenshot(page, "not-found")
})

async function openAdmin(page) {
  await openPage(page, "/others")
  await page.getByRole("button", { name: "管理を開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
}

async function loginAdmin(page) {
  await openAdmin(page)
  await page.getByRole("textbox", { name: "ユーザー名" }).fill("visual-owner")
  await page.getByLabel("パスワード").fill("visual-password")
  await page.getByRole("button", { name: "ログイン", exact: true }).click()
  await expect(page.getByRole("button", { name: "メディア一覧へ" })).toBeVisible()
}

async function openAdminMedia(page) {
  await loginAdmin(page)
  await page.getByRole("button", { name: "メディア一覧へ" }).click()
  await expect(page.getByRole("button", { name: "icon-512.pngの詳細を表示" })).toBeVisible()
  await page
    .getByTestId("app-content")
    .locator("img")
    .evaluateAll((images) => Promise.all(images.map((image) => image.decode())))
}

test("admin login", async ({ page }) => {
  await openAdmin(page)
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible()
  await screenshot(page, "admin-login")
})

test("admin dashboard", async ({ page }) => {
  await loginAdmin(page)
  await screenshot(page, "admin-dashboard")
})

test("admin media", async ({ page }) => {
  await openAdminMedia(page)
  await screenshot(page, "admin-media")
})

test("admin media detail", async ({ page }) => {
  await openAdminMedia(page)
  await page.getByRole("button", { name: "icon-512.pngの詳細を表示" }).click()
  await expect(page.getByRole("dialog", { name: "icon-512.png" })).toBeVisible()
  await expect(page.getByText("画像サイズ: 512 × 512 px")).toBeVisible()
  await screenshot(page, "admin-media-detail")
})

test("article body spacing and expansion", async ({ page }) => {
  await page.route("**/", async (route) => {
    const response = await route.fetch()
    const body = (await response.text()).replaceAll(
      "駅を出て、いつもと違う道を歩きました。",
      "駅を出て、いつもと違う道を歩きました。".repeat(6),
    )
    await route.fulfill({ response, body })
  })
  await openPage(page, "/")
  const shortBody = page.getByTestId("article-body-html").last()
  await expect(shortBody).toHaveCSS("font-size", "16px")
  await expect(shortBody).toHaveCSS("line-height", "28.8px")
  await expect(shortBody.locator("p").last()).toHaveCSS("margin-bottom", "0px")
  const expand = page.getByRole("button", { name: "続きを読む", exact: true }).first()
  await expect(expand).toBeVisible()
  await expect(page.getByText(/駅を出て.*…$/)).toHaveCSS("line-height", "28.8px")
  await expand.click()
  const expandedBody = page.getByTestId("article-body-html").first()
  await expect(expandedBody).toHaveCSS("line-height", "28.8px")
  await expect(expandedBody).toHaveCSS("letter-spacing", "normal")
  await expect(expandedBody.locator("p").first()).toHaveCSS("margin-bottom", "16px")
  await expect(expandedBody.locator("p").last()).toHaveCSS("margin-bottom", "0px")
  await page.getByRole("button", { name: "閉じる", exact: true }).click()
  await expect(expand).toBeVisible()
})
