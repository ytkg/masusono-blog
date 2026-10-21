import { expect, test } from "@playwright/test"
import { waitForClientReady } from "./helpers"

const STORAGE_KEY = "footer-navigation-diagnostic-v1"
test.use({ serviceWorkers: "block" })

async function observeReports(page) {
  const reports = []
  await page.addInitScript(() => Object.defineProperty(navigator, "standalone", { value: true }))
  await page.route("**/api/app/navigation_failures", async (route) => {
    reports.push(route.request().postDataJSON().failure)
    await route.fulfill({ status: 204 })
  })
  return reports
}

const footer = (page) => page.getByRole("navigation", { name: "メインナビゲーション" })

test("normal PWA footer navigation clears its local trace without reporting", async ({ page }) => {
  const reports = await observeReports(page)
  await page.goto("/")
  await waitForClientReady(page)
  await footer(page).getByRole("link", { name: "著者", exact: true }).click()
  await expect(page).toHaveURL(/\/authors$/)
  await expect(page.getByRole("heading", { name: "著者", exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull()
  expect(reports).toEqual([])
})

test("cached page data cannot hide a lazy module load failure from diagnostics", async ({ page }) => {
  const reports = await observeReports(page)
  await page.route(/\/(?:vite\/assets\/authors-[^/]+\.js|vite-dev\/pages\/authors\/index\.jsx)(?:\?.*)?$/, (route) => route.abort("failed"))
  const prefetched = page.waitForResponse((response) => new URL(response.url()).pathname === "/authors" && response.request().headers()["purpose"] === "prefetch")
  await page.goto("/")
  await waitForClientReady(page)
  await prefetched
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  await footer(page).getByRole("link", { name: "著者", exact: true }).click()
  await expect.poll(() => reports.find((report) => report.kind === "module_load_error")).toMatchObject({
    path: "/authors", standalone: true, data_source: "cached", stage: "module_start",
  })
  const report = reports.find((entry) => entry.kind === "module_load_error")
  expect(report.data_ready_ms).toBeGreaterThanOrEqual(0)
  expect(report.module_start_ms).toBeGreaterThanOrEqual(report.data_ready_ms)
  expect(report.module_end_ms).toBeUndefined()
  expect(report.build_version).toMatch(/^\d{12}$/)
  expect(report).not.toHaveProperty("message")
})

test("PWA startup reports the last unfinished stage and removes acknowledged storage", async ({ page }) => {
  const reports = await observeReports(page)
  await page.addInitScript((key) => {
    if (sessionStorage.getItem("seeded-navigation-trace")) return
    sessionStorage.setItem("seeded-navigation-trace", "1")
    localStorage.setItem(key, JSON.stringify({
      id: "unfinished", saved_at: Date.now(), payload: {
        kind: "navigation_interrupted", path: "/numbers", source_path: "/", standalone: true,
        stage: "module_start", tap_ms: 0, request_ms: 2, data_ready_ms: 100, module_start_ms: 101,
        elapsed_ms: 101, build_version: "202610211600", body: "private-data",
      },
    }))
  }, STORAGE_KEY)
  await page.goto("/")
  await waitForClientReady(page)
  await expect.poll(() => reports.find((report) => report.recovered)).toMatchObject({
    kind: "navigation_interrupted", stage: "module_start", standalone: true, path: "/numbers", elapsed_ms: 101,
  })
  expect(JSON.stringify(reports)).not.toContain("private-data")
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull()
})


test("native footer navigation does not leave a false unfinished PWA trace", async ({ page }) => {
  const reports = await observeReports(page)
  await page.goto("/")
  await waitForClientReady(page)
  const link = footer(page).getByRole("link", { name: "著者", exact: true })
  await link.evaluate((element) => element.addEventListener("click", (event) => {
    event.preventDefault()
    event.stopPropagation()
    window.location.assign(element.href)
  }))
  await link.click()
  await expect(page).toHaveURL(/\/authors$/)
  await expect(page.getByRole("heading", { name: "著者", exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBeNull()
  expect(reports).toEqual([])
})


test("a footer click blocked before Inertia reports the missing acceptance", async ({ page }) => {
  const reports = await observeReports(page)
  await page.goto("/")
  await waitForClientReady(page)
  const link = footer(page).getByRole("link", { name: "著者", exact: true })
  await link.evaluate((element) => element.addEventListener("click", (event) => {
    event.preventDefault()
    event.stopPropagation()
  }))
  await link.click()
  await expect.poll(() => reports.find((report) => report.kind === "navigation_stalled"), { timeout: 10000 }).toMatchObject({
    stage: "tap", path: "/authors", standalone: true,
  })
  const report = reports.find((entry) => entry.kind === "navigation_stalled")
  expect(report.release_ms).toBe(0)
  expect(report.tap_ms).toBeGreaterThanOrEqual(0)
  expect(report.request_ms).toBeUndefined()
  await expect(page).toHaveURL(/\/$/)
})
