import { expect, test } from "@playwright/test"

test.use({ serviceWorkers: "block" })

async function prepareEarlyNavigation(page) {
  const reports = []
  await page.route("**/api/app/navigation_failures", async (route) => {
    reports.push(route.request().postDataJSON().failure)
    await route.fulfill({ status: 204 })
  })
  let release
  const waiting = new Promise((resolve) => {
    release = resolve
  })
  let seen
  const started = new Promise((resolve) => {
    seen = resolve
  })
  await page.route("**/authors", async (route) => {
    if (!route.request().headers()["x-inertia"]) return route.continue()
    seen()
    const mode = await waiting
    if (mode === "network") return route.abort("failed")
    if (mode === "success") return route.continue()
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "",
      headers: { "X-Request-Id": "navigation-test-123" },
    })
  })
  await page.goto("/about")
  await page.locator("main").waitFor()
  await started
  return { reports, release }
}

for (const kind of ["http", "network"]) {
  test(`early navigation recovery ${kind}`, async ({ page }) => {
    const { reports, release } = await prepareEarlyNavigation(page)
    await page.getByRole("navigation", { name: "メインナビゲーション" }).getByText("著者", { exact: true }).click()
    release(kind)
    const dialog = page.getByRole("dialog", { name: "読み込みに失敗しました" })
    await expect(dialog).toBeVisible()
    await expect(page.locator("iframe")).toHaveCount(0)
    await expect.poll(() => reports.some((report) => report.path === "/authors" && !report.prefetch)).toBe(true)
    const report = reports.find((entry) => !entry.prefetch)
    expect(report.prefetch_in_flight).toBe(true)
    expect(report.kind).toBe(kind === "http" ? "http_exception" : "network_error")
    if (kind === "http") {
      expect(report.status).toBe(200)
      expect(report.response_request_id).toBe("navigation-test-123")
    }
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveScreenshot(`navigation-recovery-${kind}.png`)

    // The recovery link performs a full GET, bypassing Inertia's failed prefetch.
    await dialog.getByRole("link", { name: "再読み込み" }).click()
    await expect(page).toHaveURL(/\/authors$/)
    await expect(page.getByRole("heading", { name: "著者", exact: true })).toBeVisible()
    await expect(dialog).not.toBeVisible()
  })
}

test("early navigation uses a successful in-flight prefetch", async ({ page }) => {
  const { reports, release } = await prepareEarlyNavigation(page)
  await page.getByRole("navigation", { name: "メインナビゲーション" }).getByText("著者", { exact: true }).click()
  release("success")
  await expect(page).toHaveURL(/\/authors$/)
  await expect(page.getByRole("heading", { name: "著者", exact: true })).toBeVisible()
  await expect(page.getByRole("dialog")).not.toBeVisible()
  expect(reports).toEqual([])
})

test("background prefetch failure does not block the current page", async ({ page }) => {
  const { reports, release } = await prepareEarlyNavigation(page)
  release("http")
  await expect.poll(() => reports.some((report) => report.prefetch)).toBe(true)
  await expect(page.getByRole("dialog")).not.toBeVisible()
  await expect(page).toHaveURL(/\/about$/)
})
