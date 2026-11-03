import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, openPage } from "./helpers"

async function openSlot(page) {
  await openPage(page, "/others")
  await page.getByRole("button", { name: "増田スロットを開く" }).click()
  const game = page.getByRole("region", { name: "増田の野望 スロットゲーム" })
  await expect(game.getByRole("button", { name: /レバー/ })).toBeEnabled()
  return game
}

test("slot fills the area below the site header and resets on reopening", async ({ page }) => {
  const game = await openSlot(page)
  const dialog = page.getByRole("dialog", { name: "増田の野望", exact: true })
  await expect(dialog.getByRole("img", { name: "増田とその他！", exact: true })).toBeVisible()
  await expect(game.getByLabel("残高 1000ポイント")).toBeVisible()
  await expectNoPageOverflow(page)
  const geometry = await game.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { bottom: rect.bottom, width: rect.width, scroll: element.scrollHeight, height: element.clientHeight }
  })
  expect(geometry.width).toBe(page.viewportSize().width)
  expect(geometry.bottom).toBe(page.viewportSize().height)
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.height)
  await expect(page).toHaveScreenshot("slot-initial.png")
  await page.evaluate(() => {
    Math.random = () => 0.99
  })
  await game.getByRole("button", { name: /レバー/ }).click()
  for (const name of ["右", "中", "左"]) await game.getByRole("button", { name: `${name}リール停止` }).click()
  await expect(game.getByLabel("残高 997ポイント")).toBeVisible()
  await dialog.getByRole("button", { name: "閉じる", exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await page.getByRole("button", { name: "増田スロットを開く" }).click()
  await expect(game.getByLabel("残高 1000ポイント")).toBeVisible()
  await game.getByRole("button", { name: "遊び方・配列表" }).click()
  await expect(page.getByRole("dialog", { name: "遊び方・配列表" })).toBeVisible()
  await expect(page).toHaveScreenshot("slot-help.png")
})

test("slot announces a pending bonus without its type and supports keyboard stops", async ({ page }) => {
  const game = await openSlot(page)
  await page.clock.install({ time: new Date("2026-11-03T00:00:00Z") })
  await page.clock.pauseAt(new Date("2026-11-03T00:00:01Z"))
  await page.evaluate(() => {
    let count = 0
    Math.random = () => (count++ === 0 ? 0 : 0.99)
  })
  await game.getByRole("button", { name: /レバー/ }).click()
  await expect(game.getByLabel("野望ランプ点灯 ボーナス当選")).toBeVisible()
  await page.keyboard.press("3")
  await page.keyboard.press("1")
  await page.keyboard.press("2")
  await expect(game.getByRole("button", { name: "中リール停止" })).toBeDisabled()
  await expect(game.getByLabel("野望ランプ点灯 ボーナス当選")).toBeVisible()
  await expect(game.locator(".slot-message")).toHaveText("野望はまだ続く。ボーナスの絵柄を狙おう。")
  await expect(page).toHaveScreenshot("slot-pending.png")
})

test("slot controls fit a short narrow smartphone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  const game = await openSlot(page)
  await expect(game.getByRole("button", { name: /レバー/ })).toBeInViewport()
  await expect(game.getByRole("button", { name: "遊び方・配列表" })).toBeInViewport()
  const sizes = await game.evaluate((element) => ({
    width: element.clientWidth,
    scrollWidth: element.scrollWidth,
    height: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.width)
  expect(sizes.scrollHeight).toBeLessThanOrEqual(sizes.height)
  await expect(page).toHaveScreenshot("slot-short-mobile.png")
})

test("slot bonus auto stops at the next ambition time", async ({ page }) => {
  test.setTimeout(90000)
  const game = await openSlot(page)
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
  await expect(page).toHaveScreenshot("slot-bonus.png")
  await game.getByRole("button", { name: "オート消化", exact: true }).click()
  for (let i = 0; i < 120 && (await game.getByRole("button", { name: "オートを解除" }).count()); i++)
    await page.clock.runFor(1000)
  await expect(game.locator(".slot-message")).toHaveText("野望タイム突入！ 50ゲームのチャンス。")
  await expect(game.getByLabel("残高 1301ポイント")).toBeVisible()
  // Auto stopping follows animation frames, so compare the deterministic mode/status here.
  // Reel appearance is covered by the initial, pending and bonus page screenshots.
  await expect(game.locator(".slot-status")).toHaveScreenshot("slot-ambition.png")
  await page.clock.runFor(10000)
  await expect(game.getByLabel("残高 1301ポイント")).toBeVisible()
})
