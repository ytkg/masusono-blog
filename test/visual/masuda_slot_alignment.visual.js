import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

test("auto payouts keep the visible symbols aligned with the stopped reel positions", async ({ page }) => {
  test.setTimeout(90000)
  await openPage(page, "/others")
  await page.getByRole("button", { name: "スロットを開く" }).click()
  const game = page.getByRole("region", { name: "増田の野望 スロットゲーム" })
  await expect(game.getByRole("button", { name: /レバー/ })).toBeEnabled()
  await page.clock.install({ time: new Date("2026-11-03T00:00:00Z") })
  await page.clock.pauseAt(new Date("2026-11-03T00:00:01Z"))
  await page.evaluate(() => {
    let count = 0
    Math.random = () => (count++ === 0 ? 0 : 0.99)
  })
  await game.getByRole("button", { name: /レバー/ }).click()
  await page.clock.runFor(688)
  for (const name of ["右", "左", "中"]) await game.getByRole("button", { name: `${name}リール停止` }).click()
  await expect(game.locator(".slot-message")).toHaveText("BIG 入賞！ 7・7・7")
  await page.clock.runFor(200)
  for (let spin = 0; spin < 8; spin++) {
    await game.getByRole("button", { name: "オート消化", exact: true }).click()
    await page.clock.runFor(400)
    for (let i = 0; i < 10 && !(await game.locator(".slot-message").textContent()).includes("ベル！"); i++)
      await page.clock.runFor(400)
    await expect(game.locator(".slot-message")).toHaveText("ベル！ +9pt")
    await game.getByRole("button", { name: "オートを解除" }).click()
    await page.clock.runFor(200)
    await game
      .locator(".slot-strip")
      .evaluateAll((elements) =>
        Promise.all(elements.flatMap((element) => element.getAnimations().map((animation) => animation.finished))),
      )
    const reels = await game.locator(".slot-reel").evaluateAll((elements) =>
      elements.map((element) => {
        const viewport = element.getBoundingClientRect()
        const cells = [...element.querySelectorAll(".slot-symbol")].map((cell) => {
          const rect = cell.getBoundingClientRect()
          return { text: cell.textContent, center: rect.top + rect.height / 2 - viewport.top }
        })
        const expected = element.getAttribute("aria-label").split(" ")[1].split("・")
        return expected.map((text, row) => {
          const center = ((row + 0.5) * viewport.height) / 3
          const closest = cells.reduce((best, cell) =>
            Math.abs(cell.center - center) < Math.abs(best.center - center) ? cell : best,
          )
          return { expected: text, actual: closest.text, offset: Math.abs(closest.center - center) }
        })
      }),
    )
    for (const reel of reels)
      for (const row of reel) {
        expect(row.actual, JSON.stringify(reels)).toBe(row.expected)
        expect(row.offset, JSON.stringify(reels)).toBeLessThan(1)
      }
  }
})
