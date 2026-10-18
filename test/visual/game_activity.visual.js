import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("RUN accepts keys only after loading and releases them when closing", async ({ page }) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch
    window.fetch = (url, options) => {
      if (!String(url).includes("/api/app/masuda_run/rankings.json")) return originalFetch(url, options)
      return new Promise((resolve) => {
        window.finishRankingsLoad = () =>
          resolve(new Response("[]", { headers: { "Content-Type": "application/json" } }))
      })
    }
  })
  await openPage(page, "/others")
  await page.getByRole("button", { name: "増田RUNを開く" }).click()
  const content = page.getByTestId("app-content")
  await expect(content).toHaveAttribute("aria-hidden", "true")
  await expect(content).toHaveAttribute("inert", "")
  await expect.poll(() => page.evaluate(() => typeof window.finishRankingsLoad)).toBe("function")
  await page.keyboard.press("Space")
  expect(
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", cancelable: true }))),
  ).toBe(true)

  await page.evaluate(() => window.finishRankingsLoad())
  await expect(content).toHaveAttribute("aria-hidden", "false")
  await expect(content).not.toHaveAttribute("inert")
  await expect(page.getByRole("button", { name: "スタート", exact: true })).toBeVisible()
  await page.getByRole("img", { name: "増田RUNのゲーム画面" }).focus()
  await page.keyboard.press("Space")
  await expect(page.getByRole("button", { name: "ジャンプ", exact: true })).toBeVisible()

  await page.clock.install()
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
  await page.getByRole("button", { name: "閉じる", exact: true }).click()
  await expect(content).toHaveAttribute("aria-hidden", "true")
  await expect(content).toHaveAttribute("inert", "")
  expect(
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", cancelable: true }))),
  ).toBe(true)
  await page.clock.runFor(1000)
  await expect(page.getByRole("dialog")).not.toBeVisible()
  await expect(page.getByRole("button", { name: "増田RUNを開く" })).toBeFocused()
})
