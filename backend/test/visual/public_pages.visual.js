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

async function checkAuxiliaryButton(page, button) {
  await expect(button).toHaveCSS("width", "44px")
  await expect(button).toHaveCSS("height", "44px")
  await expect(button).toHaveCSS("color", "rgb(102, 102, 102)")
  await expect(button).toHaveCSS("opacity", "1")
  await expect(button.locator("svg")).toHaveCSS("font-size", "20px")
  await page.keyboard.press("Tab")
  await button.focus()
  await expect(button).toHaveCSS("outline", "rgb(0, 0, 0) solid 2px")
  await expect(button).toHaveCSS("outline-offset", "2px")
  await button.hover()
  await expect(button).toHaveCSS("background-color", "rgb(245, 245, 245)")
}

async function expectPageHeading(page, name) {
  const heading = page.getByRole("heading", { name, level: 1, exact: true })
  await expect(heading).toHaveCSS("font-size", "24px")
  await expect(heading).toHaveCSS("font-weight", "700")
  await expect(heading).toHaveCSS("line-height", "30px")
  await expect(heading).toHaveCSS("letter-spacing", "normal")
  const layout = await heading.evaluate((element) => {
    const title = element.getBoundingClientRect()
    const content = element.nextElementSibling.getBoundingClientRect()
    return { gap: content.top - title.bottom, width: element.clientWidth, scrollWidth: element.scrollWidth }
  })
  expect(layout.gap).toBe(24)
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width)
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
    if (["about", "authors", "numbers"].includes(name)) {
      await expectPageHeading(page, heading)
    }
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
  const menu = page.getByRole("button", { name: "記事メニューを開く" }).first()
  await checkAuxiliaryButton(page, menu)
  await menu.click()
  await expect(page.getByRole("menuitem", { name: "記事URLをコピー" })).toBeVisible()
  await page.keyboard.press("Escape")
  const clear = page.getByRole("button", { name: "検索語をクリア" })
  await checkAuxiliaryButton(page, clear)
  await expect(page.locator(".MuiInputBase-root")).toHaveCSS("height", "40px")
  await clear.click()
  await expect(page.getByRole("textbox", { name: "記事を検索" })).toHaveValue("")
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
    const close = page.getByRole("button", { name: "閉じる", exact: true })
    await checkAuxiliaryButton(page, close)
    await close.click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
    await expect(page.getByRole("button", { name: button })).toBeFocused()
  })
}

test("not found", async ({ page }) => {
  await openPage(page, "/articles/visual-missing", 404)
  await expect(page.getByRole("heading", { name: "ページが見つかりません" })).toBeVisible()
  await expectPageHeading(page, "ページが見つかりません")
  await screenshot(page, "not-found")
  await page.getByRole("link", { name: "ホームに戻る" }).click()
  await expect(page.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
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

for (const state of ["input", "save", "notification"]) {
  test(`settings ${state} error`, async ({ page }) => {
    await page.context().addCookies([{ name: "user_id", value: "visual-user", url: "http://localhost:3000" }])
    await page.route("**/api/app/users.json", (route) => route.fulfill({ status: 500, body: "{}" }))
    await page.addInitScript(() => {
      Object.defineProperty(window, "Notification", {
        value: {
          permission: "default",
          requestPermission: async () => {
            throw new Error("Test failure")
          },
        },
      })
      Object.defineProperty(navigator, "serviceWorker", {
        value: {
          register: async () => ({}),
          ready: Promise.resolve({ pushManager: { getSubscription: async () => null } }),
        },
      })
      window.PushManager = function () {}
    })
    await openPage(page, "/others")
    await page.getByRole("button", { name: "設定を開く" }).click()
    await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
    if (state === "notification") {
      await page.getByRole("switch", { name: "新着記事の通知" }).click()
      await expect(page.getByRole("alert")).toContainText("通知設定の更新に失敗しました")
    } else {
      await page.getByRole("button", { name: "変更", exact: true }).click()
      await page.getByRole("textbox", { name: "表示名" }).fill(state === "input" ? " " : "新しい名前")
      await page.getByRole("button", { name: "保存", exact: true }).click()
      await expect(page.getByRole("alert")).toContainText(
        state === "input" ? "表示名を入力してください" : "表示名の保存に失敗しました",
      )
    }
    const alert = page.getByRole("alert")
    const target =
      state === "input"
        ? page.getByRole("textbox", { name: "表示名" })
        : state === "save"
          ? page.getByRole("button", { name: "保存", exact: true })
          : page.getByRole("switch", { name: "新着記事の通知" })
    const targetBox = await target.evaluate((element, state) => {
      const row =
        state === "input"
          ? element.closest(".MuiInputBase-root")
          : state === "notification"
            ? element.closest(".MuiSwitch-root").parentElement
            : element.parentElement.parentElement
      const { y, height } = row.getBoundingClientRect()
      return { y, height }
    }, state)
    const alertBox = await alert.boundingBox()
    expect(alertBox.y - (targetBox.y + targetBox.height)).toBeCloseTo(8, 0)
    expect(alertBox.x + alertBox.width).toBeLessThanOrEqual(page.viewportSize().width)
    await screenshot(page, `settings-${state}-error`)
  })
}

test("numbers trend", async ({ page }) => {
  await openPage(page, "/numbers")
  const chart = page.getByTestId("numbers-trend")
  await chart.scrollIntoViewIfNeeded()
  await expect(chart.getByTestId("trend-line-totalArticles")).not.toHaveAttribute("stroke-dasharray")
  await expect(chart.getByTestId("trend-line-totalChars")).toHaveAttribute("stroke-dasharray", "6 4")
  await expect(chart.locator("svg[role=img] text").first()).toHaveAttribute("font-size", "12")
  await page.addStyleTag({ content: "header, nav { visibility: hidden !important; }" })
  await expect(chart.getByText("総記事数", { exact: true })).toHaveCSS("color", "rgb(102, 102, 102)")
  await expect(chart.getByText("総記事数", { exact: true })).toHaveCSS("font-size", "14px")
  await expect(chart).toHaveScreenshot("numbers-trend.png")
})
