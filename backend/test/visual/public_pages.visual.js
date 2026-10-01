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
})

test.describe("article titles", () => {
  test.use({ serviceWorkers: "block" })

  test("long article title wraps in list and detail", async ({ page }) => {
    const title = "週末の散歩で見つけたもの".repeat(5) + "LongUnbrokenArticleTitle".repeat(4)
    await page.route("**/*", async (route) => {
      const path = new URL(route.request().url()).pathname
      if (path !== "/" && path !== "/articles/visual-article-1") return route.continue()
      const response = await route.fetch()
      if (response.headers()["content-type"]?.includes("application/json")) {
        const json = await response.json()
        if (json.props?.article) json.props.article.title = title
        await route.fulfill({ response, body: JSON.stringify(json) })
        return
      }
      const body = (await response.text()).replaceAll("週末の散歩で見つけたもの", title)
      await route.fulfill({ response, body })
    })
    await openPage(page, "/")
    const listTitle = page.getByRole("heading", { name: title, level: 3 })
    await expect(listTitle).toHaveCSS("font-size", "20px")
    await expect(listTitle).toHaveCSS("line-height", "25px")
    await screenshot(page, "article-title-long-list")
    await page.getByRole("link", { name: title, exact: true }).click()
    await expect(page).toHaveURL(/\/articles\/visual-article-1$/)
    const detailTitle = page.getByRole("heading", { name: title, level: 1 })
    await expect(detailTitle).toHaveCSS("font-size", "24px")
    await expect(detailTitle).toHaveCSS("line-height", "30px")
    await expect(detailTitle).toHaveCSS("margin-bottom", "16px")
    await expect(detailTitle).toHaveCSS("font-weight", "700")
    await expect(detailTitle).toHaveCSS("letter-spacing", "normal")
    await expect(detailTitle).toHaveCSS("overflow-wrap", "anywhere")
    const box = await detailTitle.boundingBox()
    expect(box.height).toBeGreaterThan(30)
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize().width)
    await screenshot(page, "article-title-long-detail")
  })
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

for (const state of ["success", "error"]) {
  test(`copy ${state}`, async ({ page }) => {
    await page.addInitScript((state) => {
      Object.defineProperty(navigator, "clipboard", {
        value: {
          writeText: async () => {
            if (state === "error") throw new Error("denied")
          },
        },
      })
    }, state)
    await openPage(page, "/articles/visual-article-1")
    await page.getByRole("button", { name: "記事メニューを開く" }).first().click()
    await page.getByRole("menuitem", { name: "記事URLをコピー" }).click()
    await expect(page.getByRole("alert")).toContainText(state === "success" ? "完了" : "失敗")
    await screenshot(page, `copy-${state}`)
    if (state === "error") {
      await page.waitForTimeout(3200)
      await expect(page.getByRole("alert")).toBeVisible()
      await page.getByRole("button", { name: "閉じる", exact: true }).click()
      await expect(page.getByRole("alert")).not.toBeVisible()
    } else {
      await expect(page.getByRole("alert")).not.toBeVisible({ timeout: 5000 })
    }
  })
}

for (const state of ["empty", "error"]) {
  test(`rankings ${state}`, async ({ page }) => {
    await page.addInitScript((state) => {
      const originalFetch = window.fetch
      window.fetch = (url, options) => {
        if (String(url).includes("/api/app/masuda_run/rankings.json")) {
          return Promise.resolve(
            new Response(
              state === "error" ? JSON.stringify({ error: { message: "ランキングの取得に失敗しました。" } }) : "[]",
              {
                status: state === "error" ? 500 : 200,
                headers: { "Content-Type": "application/json" },
              },
            ),
          )
        }
        return originalFetch(url, options)
      }
    }, state)
    await openPage(page, "/others")
    await page.getByRole("button", { name: "増田RUNを開く" }).click()
    await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
    await expect(
      page.getByText(state === "error" ? "ランキングの取得に失敗しました。" : "まだランキングがありません。"),
    ).toBeVisible()
    const message = state === "error" ? page.getByRole("alert") : page.getByText("まだランキングがありません。")
    await expect(message).toHaveCSS("font-size", "14px")
    await expect(message).toHaveCSS("line-height", "21px")
    await expect(message).toHaveCSS("color", state === "error" ? "rgb(0, 0, 0)" : "rgb(102, 102, 102)")
    await screenshot(page, `rankings-${state}`)
  })
}

for (const state of ["loading", "warning", "error"]) {
  test(`ruby ${state}`, async ({ page }) => {
    await page.addInitScript((state) => {
      window.Worker = class {
        addEventListener(type, listener) {
          if (type === "message") this.listener = listener
        }
        postMessage() {
          if (state === "error") this.listener({ data: { error: "Ruby の実行に失敗しました。" } })
        }
        terminate() {}
      }
    }, state)
    await page.route("**/articles/visual-article-1", async (route) => {
      const response = await route.fetch()
      const body = (await response.text()).replaceAll(
        "ゆっくり過ごした週末の記録です。",
        JSON.stringify('</p><pre><code class="language-ruby">puts :hello</code></pre><p>').slice(1, -1),
      )
      await route.fulfill({ response, body })
    })
    await openPage(page, "/articles/visual-article-1")
    await page.getByRole("button", { name: "▶ 実行" }).click()
    const runner = page.getByTestId("ruby-code-runner")
    await runner.scrollIntoViewIfNeeded()
    if (state === "loading") await expect(runner.getByRole("status")).toBeVisible()
    else await expect(runner.getByRole("alert")).toContainText(state === "warning" ? "注意" : "失敗")
    const message = state === "loading" ? runner.getByText("実行中...") : runner.getByRole("alert")
    await expect(message).toHaveCSS("font-size", "14px")
    await expect(message).toHaveCSS("line-height", "21px")
    await expect(message).toHaveCSS("color", state === "loading" ? "rgb(102, 102, 102)" : "rgb(0, 0, 0)")
    await expect(runner).toHaveScreenshot(`ruby-${state}.png`)
  })
}
