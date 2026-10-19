import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test.beforeEach(async ({ page }) => {
  // Control the Page Visibility signal without depending on the host window manager.
  await page.addInitScript(() => {
    let visibility = "visible"
    Object.defineProperty(document, "visibilityState", { get: () => visibility })
    window.setGameVisibility = (value) => {
      visibility = value
      document.dispatchEvent(new Event("visibilitychange"))
    }
  })
})

test("RUN pauses score and releases input while the page is hidden", async ({ page }) => {
  await page.route("**/api/app/masuda_run/rankings.json", (route) => route.fulfill({ json: [] }))
  await openPage(page, "/others")
  await page.getByRole("button", { name: "増田RUNを開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await page.clock.install()
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
  await page.evaluate(() => window.setGameVisibility("hidden"))
  await page.getByRole("button", { name: "スタート", exact: true }).click()
  await expect(page.getByRole("button", { name: "スタート", exact: true })).toBeVisible()
  await page.evaluate(() => window.setGameVisibility("visible"))
  await page.getByRole("button", { name: "スタート", exact: true }).click()
  await page.clock.runFor(300)
  const score = page.getByText(/^スコア /)
  const before = await score.textContent()
  await page.evaluate(() => window.setGameVisibility("hidden"))
  await page.clock.runFor(60000)
  await expect(score).toHaveText(before)
  await expect(page.getByRole("button", { name: "ジャンプ", exact: true })).toBeVisible()
  expect(
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", cancelable: true }))),
  ).toBe(true)
  await page.evaluate(() => window.setGameVisibility("visible"))
  await page.clock.runFor(100)
  await expect(score).not.toHaveText(before)
})

test("Tataki preserves countdown and the live round across page visibility changes", async ({ page }) => {
  await openPage(page, "/others")
  await page.getByRole("button", { name: "増田たたきを開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await expect(page.getByRole("button", { name: "スタート", exact: true })).toBeEnabled()
  await page.clock.install()
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
  await page.getByRole("button", { name: "スタート", exact: true }).click()
  await page.clock.runFor(1500)
  await expect(page.getByRole("status")).toHaveText("2")
  await page.evaluate(() => window.setGameVisibility("hidden"))
  await page.clock.runFor(60000)
  await expect(page.getByRole("status")).toHaveText("2")
  await page.evaluate(() => window.setGameVisibility("visible"))
  await page.clock.runFor(1530)
  await expect(page.getByText("残り 30秒", { exact: true })).toBeVisible()
  const holes = page.getByRole("button", { name: /^穴[1-9]/ })
  const target = page.getByRole("button", { name: /^穴[1-9] (増田|その他)$/ }).first()
  await expect(target).toBeVisible()
  const before = await holes.evaluateAll((nodes) => nodes.map((node) => node.outerHTML))
  await page.evaluate(() => window.setGameVisibility("hidden"))
  await page.clock.runFor(60000)
  await target.dispatchEvent("pointerdown")
  await expect(page.getByText("0点", { exact: true })).toBeVisible()
  await expect(page.getByText("残り 30秒", { exact: true })).toBeVisible()
  expect(await holes.evaluateAll((nodes) => nodes.map((node) => node.outerHTML))).toEqual(before)
  await page.evaluate(() => window.setGameVisibility("visible"))
  await page.clock.runFor(1000)
  await expect(page.getByText("残り 29秒", { exact: true })).toBeVisible()
})
