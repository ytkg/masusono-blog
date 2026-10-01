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

async function expectSectionHeading(heading) {
  await expect(heading).toHaveCSS("font-size", "20px")
  await expect(heading).toHaveCSS("font-weight", "700")
  await expect(heading).toHaveCSS("line-height", "25px")
  await expect(heading).toHaveCSS("margin-bottom", "16px")
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
    if (["about", "others", "authors", "numbers"].includes(name)) {
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

test.describe("author profiles", () => {
  test.use({ serviceWorkers: "block" })

  test("long profiles and missing images", async ({ page }) => {
    const title = "日常の発見を記録する人".repeat(8)
    const bio = "散歩と食事が好きです。気になった出来事を、肩の力を抜いて書いています。".repeat(6)
    await page.route("**/*", async (route) => {
      const path = new URL(route.request().url()).pathname
      if (!["/authors", "/authors/visual-author-1", "/authors/visual-author-2"].includes(path)) {
        return route.continue()
      }
      const response = await route.fetch()
      const body = (await response.text())
        .replaceAll("日常の発見を記録する人", title)
        .replaceAll("散歩と食事が好きです。気になった出来事を、肩の力を抜いて書いています。", bio)
        .replace(/("id":"visual-author-1"[^}]*"imageUrl":)null/, '$1"/icons/icon-512.png"')
      await route.fulfill({ response, body })
    })
    for (const [name, path] of [
      ["list", "/authors"],
      ["detail", "/authors/visual-author-1"],
    ]) {
      await openPage(page, path)
      const image = page.locator("main img").first()
      await expect(image).toHaveCSS("width", page.viewportSize().width < 600 ? "112px" : "128px")
      const label = page.getByText(title, { exact: true })
      await expect(label).toHaveCSS("font-size", "13px")
      await expect(label).toHaveCSS("font-weight", "700")
      const imageBox = await image.boundingBox()
      const labelBox = await label.boundingBox()
      expect(labelBox.y - (imageBox.y + imageBox.height)).toBe(page.viewportSize().width < 600 ? 10 : 12)
      const nameHeading = page.getByRole("heading", { name: "増田愛美", exact: true }).first()
      await expect(nameHeading).toHaveCSS("font-size", "24px")
      await expect(nameHeading).toHaveCSS("font-weight", "700")
      await expect(page.getByText(bio, { exact: true })).toHaveCSS("font-size", "16px")
      await expect(page.getByText(bio, { exact: true })).toHaveCSS("line-height", "30.4px")
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize().width)
      await expect.soft(page).toHaveScreenshot(`author-profile-long-${name}.png`)
    }
    await openPage(page, "/authors/visual-author-2")
    await expect(page.locator("main img")).toHaveCount(0)
    await expect(page.getByRole("heading", { name: "チャーリー", level: 1 })).toBeVisible()
    await expect.soft(page).toHaveScreenshot("author-profile-no-image.png")
    await openPage(page, "/authors")
    await page.getByRole("link", { name: "チャーリーの記事を読む", exact: true }).click()
    await expect(page).toHaveURL(/\/authors\/visual-author-2$/)
    await expect(page.getByRole("heading", { name: "投稿", exact: true })).toBeVisible()
  })
})

test("search suggestions", async ({ page }) => {
  await openPage(page, "/search")
  for (const name of ["著者から探す", "タグから探す", "読了目安から探す"]) {
    await expectSectionHeading(page.getByRole("heading", { name, level: 2 }))
  }
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
    const title = page.getByRole("dialog").getByRole("heading", { level: 2 }).first()
    await expect(title).toHaveCSS("font-size", "24px")
    await expect(title).toHaveCSS("font-weight", "700")
    await expect(title).toHaveCSS("line-height", "30px")
    if (name === "settings") {
      for (const label of ["表示名", "新着記事の通知"]) {
        const item = page.getByRole("dialog").getByText(label, { exact: true })
        await expect(item).toHaveCSS("font-size", "14px")
        await expect(item).toHaveCSS("font-weight", "700")
        await expect(item).toHaveCSS("line-height", "21px")
        await expect(item).toHaveCSS("letter-spacing", "normal")
      }
    }
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

test.describe("admin articles", () => {
  test.use({ serviceWorkers: "block" })

  test("list and filters", async ({ page }) => {
    await page.route("**/api/app/management/articles?*", (route) =>
      route.fulfill({
        json: {
          articles: [
            { id: "published", title: "公開中の記事", status: "PUBLISH", updated_at: "2026-01-02T00:00:00Z" },
            { id: "draft", title: "下書きの記事", status: "DRAFT", updated_at: "2026-01-01T00:00:00Z" },
          ],
          total_count: 3,
          page: 1,
          has_more: true,
        },
      }),
    )
    await loginAdmin(page)
    await page.getByRole("button", { name: "記事一覧へ" }).click()
    await expect(page.getByText("公開中の記事", { exact: true })).toBeVisible()
    await expect(page.getByRole("combobox", { name: "公開状態" })).toBeVisible()
    await expect(page.getByRole("button", { name: "もっと見る" })).toBeVisible()
    await screenshot(page, "admin-articles")
  })
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
  await page.getByRole("button", { name: "メディア詳細を閉じる" }).click()
  await expect(page.getByRole("dialog", { name: "icon-512.png" })).not.toBeVisible()
  await expect(page.getByRole("button", { name: "icon-512.pngの詳細を表示" })).toBeFocused()
  await expect(page.getByRole("dialog", { name: "管理", exact: true })).toBeVisible()
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
  await expect(expand).toHaveCSS("font-size", "12px")
  await expect(expand).toHaveCSS("height", "44px")
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
  await expectSectionHeading(chart.getByRole("heading", { name: "推移", level: 2 }))
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
    await page.clock.install()
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
    await page.clock.fastForward(300)
    await expect.poll(async () => {
      const navigation = await page.getByRole("navigation", { name: "メインナビゲーション" }).boundingBox()
      const notice = await page.getByRole("alert").boundingBox()
      return Math.round(navigation.y - (notice.y + notice.height))
    }).toBe(8)
    await screenshot(page, `copy-${state}`)
    await page.clock.fastForward(3200)
    if (state === "error") {
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
    if (state === "warning") await page.clock.install()
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
    const run = page.getByRole("button", { name: "▶ 実行" })
    await expect(run).toHaveCSS("font-size", "12px")
    await expect(run).toHaveCSS("height", "44px")
    await run.click()
    if (state === "warning") await page.clock.fastForward(3000)
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

for (const width of [390, 600, 1280, 1920, 2560]) {
  test(`navigation alignment at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop")
    await page.setViewportSize({ width, height: 844 })
    await openPage(page, "/")
    await openPage(page, "/articles/visual-article-1")
    const bounds = await page.evaluate(() => {
      const main = document.querySelector("main")
      const content = main.firstElementChild
      const rect = (element) => {
        const { x, width } = element.getBoundingClientRect()
        return { x, width }
      }
      return {
        main: rect(main),
        contentLeft: content.getBoundingClientRect().x + parseFloat(getComputedStyle(content).paddingLeft),
        toolbar: rect(document.querySelector("header .MuiToolbar-root")),
        backButton: rect(document.querySelector('button[aria-label="前のページに戻る"]')),
        nav: rect(document.querySelector('nav[aria-label="メインナビゲーション"]')),
        scrollWidth: document.documentElement.scrollWidth,
      }
    })
    const outerWidth = Math.min(width, 1200)
    const padding = width < 600 ? 16 : 24
    const left = (width - outerWidth) / 2 + padding
    expect(bounds.main.width).toBe(outerWidth)
    expect(bounds.toolbar).toEqual(bounds.main)
    expect(bounds.contentLeft).toBe(left)
    expect(bounds.backButton.x).toBeCloseTo(left, 0)
    expect(bounds.nav.x).toBe(left)
    expect(bounds.nav.width).toBe(outerWidth - padding * 2)
    expect(bounds.scrollWidth).toBe(width)
    const links = page.getByRole("navigation", { name: "メインナビゲーション" }).getByRole("link")
    await expect(links).toHaveCount(5)
    for (const link of await links.all()) {
      await expect(link).toBeVisible()
      const box = await link.boundingBox()
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
    await screenshot(page, `navigation-alignment-${width}`)
    await page
      .getByRole("navigation", { name: "メインナビゲーション" })
      .getByRole("link", { name: "著者", exact: true })
      .click()
    await expect(page).toHaveURL(/\/authors$/)
    await page.goBack()
    await expect(page).toHaveURL(/\/articles\/visual-article-1$/)
    await page.getByRole("button", { name: "前のページに戻る" }).click()
    await expect(page).toHaveURL(/\/$/)
  })
}

test.describe("admin feedback states", () => {
  test.use({ serviceWorkers: "block" })

for (const state of ["session", "login", "articles", "media", "upload"]) {
  test(`admin feedback ${state}`, async ({ page }) => {
    const error = { error: { message: "テスト用の通信失敗" } }
    if (state === "session") {
      await page.route("**/api/app/management/session", (route) => route.fulfill({ status: 500, json: error }))
      await openAdmin(page)
    } else if (state === "login") {
      await page.route("**/api/app/management/session", (route) =>
        route.request().method() === "POST" ? route.fulfill({ status: 500, json: error }) : route.continue(),
      )
      await openAdmin(page)
      await page.getByRole("textbox", { name: "ユーザー名" }).fill("visual-owner")
      await page.getByLabel("パスワード").fill("visual-password")
      await page.getByRole("button", { name: "ログイン", exact: true }).click()
    } else {
      await loginAdmin(page)
      if (state === "articles" || state === "media") {
        await page.route(`**/api/app/management/${state}?*`, (route) => route.fulfill({ status: 500, json: error }))
        await page.getByRole("button", { name: state === "articles" ? "記事一覧へ" : "メディア一覧へ" }).click()
      } else {
        await page.getByRole("button", { name: "メディア一覧へ" }).click()
        await page.locator('input[type="file"]').setInputFiles({ name: "invalid.txt", mimeType: "text/plain", buffer: Buffer.from("test") })
      }
    }
    const alert = page.getByRole("alert")
    await expect(alert).toContainText("失敗")
    await expect(alert).toHaveCSS("font-size", "14px")
    await expect(alert).toHaveCSS("line-height", "21px")
    await screenshot(page, `admin-feedback-${state}`)
  })
}

test("admin feedback empty", async ({ page }) => {
  await loginAdmin(page)
  await page.route("**/api/app/management/articles?*", (route) => route.fulfill({ json: { articles: [], page: 1, has_more: false, total_count: 0 } }))
  await page.getByRole("button", { name: "記事一覧へ" }).click()
  const empty = page.getByText("記事が見つかりませんでした。")
  await expect(empty).toHaveCSS("font-size", "14px")
  await expect(empty).toHaveCSS("color", "rgb(102, 102, 102)")
  await screenshot(page, "admin-feedback-empty")
})

test("admin feedback loading", async ({ page }) => {
  await loginAdmin(page)
  let release
  const ready = new Promise((resolve) => { release = resolve })
  await page.route("**/api/app/management/articles?*", async (route) => {
    await ready
    await route.fulfill({ json: { articles: [], page: 1, has_more: false, total_count: 0 } })
  })
  await page.getByRole("button", { name: "記事一覧へ" }).click()
  await expect(page.getByRole("status").filter({ hasText: "読み込み中" })).toBeVisible()
  try {
    await screenshot(page, "admin-feedback-loading")
  } finally {
    release()
  }
  await expect(page.getByText("記事が見つかりませんでした。")).toBeVisible()
})

})

test("public empty status", async ({ page }) => {
  await openPage(page, "/search?q=unmatched-visual-query")
  const empty = page.getByText("該当する記事はありません。")
  await expect(empty).toHaveCSS("font-size", "14px")
  await expect(empty).toHaveCSS("line-height", "21px")
  await expect(empty).toHaveCSS("color", "rgb(102, 102, 102)")
  await screenshot(page, "public-empty-status")
})

for (const target of ["title", "author", "sentence"]) {
  test(`article focus ${target}`, async ({ page }) => {
    await openPage(page, "/")
    if (target === "sentence") {
      await page.getByRole("tab", { name: "書き出し" }).click()
    }
    const link = target === "title"
      ? page.getByRole("heading", { name: "週末の散歩で見つけたもの" }).getByRole("link")
      : target === "author"
        ? page.getByTestId("article-meta-author").first()
        : page.locator(".sentence-card").first()
    await page.keyboard.press("Tab")
    await link.focus()
    await expect(link).toHaveCSS("outline", "rgb(0, 0, 0) solid 2px")
    await expect(link).toHaveCSS("outline-offset", "2px")
    await screenshot(page, `article-focus-${target}`)
    await page.keyboard.press("Tab")
    await expect(link).not.toBeFocused()
  })
}
