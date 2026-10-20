import { test, expect } from "@playwright/test"
import { waitForClientReady } from "./helpers"

const historyLogs = new WeakMap()

test.beforeEach(async ({ page }) => {
  const events = []
  historyLogs.set(page, events)
  await page.exposeFunction("recordNavigationHistory", (event) => {
    events.push(event)
    if (events.length > 200) events.shift()
  })
  await page.addInitScript(() => {
    const record = (type, details = {}) => {
      void window.recordNavigationHistory({
        type,
        time: Date.now(),
        url: location.href,
        pageUrl: history.state?.page?.url,
        ...details,
      })
    }
    for (const method of ["pushState", "replaceState"]) {
      const original = history[method].bind(history)
      history[method] = (...args) => {
        const before = location.href
        const stack = new Error().stack
        const result = original(...args)
        record(method, { before, stack })
        return result
      }
    }
    window.addEventListener("popstate", () => record("popstate"))
    document.addEventListener("inertia:navigate", () => record("inertia:navigate"))
  })
})

test.afterEach(async ({ page }, testInfo) => {
  try {
    // Drain background requests before removing the production-origin proxy.
    await page.waitForLoadState("networkidle")
  } finally {
    if (testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach("navigation-history", {
        body: JSON.stringify(historyLogs.get(page), null, 2),
        contentType: "application/json",
      })
    }
    await page.unrouteAll({ behavior: "wait" })
  }
})

// Serve real Rails/Vite output under the production origin without sending data to Google.
test("GA4 hydration, Inertia history and related links", async ({ page, baseURL }) => {
  const queued = []
  await page.exposeFunction("recordAnalytics", (args) => queued.push(args))
  await page.addInitScript(() => {
    const dataLayer = []
    dataLayer.push = (...items) => {
      items.forEach((args) => window.recordAnalytics([...args]))
      return Array.prototype.push.apply(dataLayer, items)
    }
    window.dataLayer = dataLayer
    navigator.serviceWorker.register = async () => ({})
  })
  await page.route("https://www.googletagmanager.com/**", (route) =>
    route.fulfill({ body: "", contentType: "text/javascript" }),
  )
  await page.route("https://masusono.com/**", async (route) => {
    const url = new URL(route.request().url())
    const response = await route.fetch({ url: `${baseURL}${url.pathname}${url.search}` })
    let body = await response.body()
    if (response.headers()["content-type"]?.includes("text/html")) {
      body = (await response.text()).replace("<head>", '<head><meta name="ga4-measurement-id" content="G-5930S30RWS">')
    }
    await route.fulfill({ response, body })
  })
  const views = () => queued.filter(([command, event]) => command === "event" && event === "page_view")
  const clicks = () => queued.filter(([command, event]) => command === "event" && event === "related_article_click")
  async function expectView(count, path) {
    await expect.poll(() => views().length).toBe(count)
    expect(views().at(-1)[2].page_location).toBe(`https://masusono.com${path}`)
    // Inertia Head batches DOM updates after the React commit used for analytics.
    await expect.poll(() => page.title()).toBe(views().at(-1)[2].page_title)
  }
  const article = "/articles/visual-article-1?utm_source=x&utm_medium=social"
  await page.goto(`https://masusono.com${article}`)
  await waitForClientReady(page)
  await expectView(1, article)
  const browserId = (await page.context().cookies()).find(({ name }) => name === "user_id").value
  expect(queued.find(([command]) => command === "config")[2].client_id).toBe(browserId)
  expect(browserId).toMatch(/^[0-9a-f-]{36}$/i)
  await page.getByRole("link", { name: "ホーム", exact: true }).click()
  await expectView(2, "/")
  await page.getByRole("link", { name: "友人と食べた昼ごはん", exact: true }).click()
  await expectView(3, "/articles/visual-article-2")
  await page.goBack()
  await expectView(4, "/")
  await page.goBack()
  await expectView(5, article)
  await page.goForward()
  await expectView(6, "/")
  await page.goForward()
  await expectView(7, "/articles/visual-article-2")
  await page.getByRole("region", { name: "日常の記事" }).getByRole("link").click()
  await expect.poll(() => clicks().length).toBe(1)
  expect(clicks()[0][2]).toMatchObject({
    source_article_id: "visual-article-2",
    target_article_id: "visual-article-1",
    link_position: 1,
  })
  await expectView(8, "/articles/visual-article-1")
  await page.getByRole("link", { name: "その他！", exact: true }).click()
  await expect(page).toHaveURL("https://masusono.com/others")
  await expect.poll(() => page.evaluate(() => window["ga-disable-G-5930S30RWS"])).toBe(true)
  expect(views()).toHaveLength(8)
  await page.goBack()
  await expectView(9, "/articles/visual-article-1")
  expect(await page.evaluate(() => window["ga-disable-G-5930S30RWS"])).toBe(false)

  // A fresh document starting in management does not initialize Google at all.
  await page.goto("https://masusono.com/others")
  await waitForClientReady(page)
  await page.locator("main").waitFor()
  expect(await page.evaluate(() => window.gtag)).toBeUndefined()
  expect(views()).toHaveLength(9)
  await page.getByRole("link", { name: "ホーム", exact: true }).click()
  await expectView(10, "/")
  expect(queued.filter(([command]) => command === "config").at(-1)[2].client_id).toBe(browserId)
})

// The server's private policy response is the only exclusion information exposed to the browser.
test("excluded browser never loads or initializes Google across reload and history", async ({ page, baseURL }) => {
  let policyChecks = 0
  await page.addInitScript(() => {
    navigator.serviceWorker.register = async () => ({})
  })
  const googleRequests = []
  await page.route(/https:\/\/[^/]*(?:googletagmanager|google-analytics)\.com\//, (route) =>
    route.fulfill({ body: "", contentType: "text/javascript" }),
  )
  page.on("request", (request) => {
    if (/(?:googletagmanager|google-analytics)\.com/.test(request.url())) googleRequests.push(request.url())
  })
  await page.route("https://masusono.com/**", async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === "/api/app/analytics.json") {
      policyChecks++
      await route.fulfill({ json: { allowed: false } })
      return
    }
    const response = await route.fetch({ url: `${baseURL}${url.pathname}${url.search}` })
    let body = await response.body()
    if (response.headers()["content-type"]?.includes("text/html")) {
      body = (await response.text()).replace("<head>", '<head><meta name="ga4-measurement-id" content="G-5930S30RWS">')
    }
    await route.fulfill({ response, body })
  })
  await page.goto("https://masusono.com/articles/visual-article-2")
  await waitForClientReady(page)
  await expect.poll(() => policyChecks).toBeGreaterThan(0)
  const beforeReload = policyChecks
  await page.reload()
  await waitForClientReady(page)
  await expect.poll(() => policyChecks).toBeGreaterThan(beforeReload)
  await page.getByRole("region", { name: "日常の記事" }).getByRole("link").click()
  await expect(page).toHaveURL("https://masusono.com/articles/visual-article-1")
  // Related article links load a new document, so the URL alone does not imply hydration.
  await waitForClientReady(page)
  await page.getByRole("link", { name: "ホーム", exact: true }).click()
  await expect(page).toHaveURL("https://masusono.com/")
  await page.goBack()
  await expect(page).toHaveURL("https://masusono.com/articles/visual-article-1")
  await page.goForward()
  await expect(page).toHaveURL("https://masusono.com/")
  await expect.poll(() => policyChecks).toBeGreaterThan(3)
  expect(await page.evaluate(() => window.gtag)).toBeUndefined()
  await expect.poll(() => page.evaluate(() => window["ga-disable-G-5930S30RWS"])).toBe(true)
  expect(googleRequests).toEqual([])
})
