import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, openPage } from "./helpers"

async function openSlot(page) {
  await openPage(page, "/others")
  await page.getByRole("button", { name: "スロットを開く" }).click()
  const game = page.getByRole("region", { name: "増田の野望 スロットゲーム" })
  await expect(game.getByRole("button", { name: /レバー/ })).toBeEnabled()
  return game
}

test("slot uses the shared app header and resets on reopening", async ({ page }) => {
  await openPage(page, "/others")
  await expect(page.getByText("スロット", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "強欲を開く" }).click()
  const other = page.getByRole("dialog", { name: "強欲は身を滅ぼす？", exact: true })
  await expect(other.getByRole("button", { name: "買い物を始める" })).toBeEnabled()
  const reference = await other
    .getByRole("heading", { name: "強欲は身を滅ぼす？", level: 2, exact: true })
    .boundingBox()
  await other.getByRole("button", { name: "閉じる", exact: true }).click()
  await expect(other).not.toBeVisible()
  const game = await openSlot(page)
  const dialog = page.getByRole("dialog", { name: "増田スロット", exact: true })
  await expect(dialog.getByRole("img", { name: "増田とその他！", exact: true })).toHaveCount(0)
  const heading = await dialog.getByRole("heading", { name: "増田スロット", level: 2, exact: true }).boundingBox()
  expect(heading.y).toBe(reference.y)
  expect(heading.height).toBe(reference.height)
  await expect(game.getByLabel("残高 1000ポイント")).toBeVisible()
  await expectNoPageOverflow(page)
  const geometry = await game.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    return { bottom: rect.bottom, width: rect.width, scroll: element.scrollHeight, height: element.clientHeight }
  })
  expect(geometry.width).toBe(page.viewportSize().width)
  expect(geometry.bottom).toBe(page.viewportSize().height)
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.height)
  const reels = await game.locator(".slot-reel").all()
  const stops = await game.locator(".slot-stop").all()
  for (let i = 0; i < 3; i++) {
    const reel = await reels[i].boundingBox()
    const stop = await stops[i].boundingBox()
    expect(Math.abs(reel.x + reel.width / 2 - stop.x - stop.width / 2)).toBeLessThan(8)
    expect(stop.y).toBeGreaterThan(reel.y + reel.height)
  }
  await expect(page).toHaveScreenshot("slot-initial.png")
  await page.evaluate(() => {
    Math.random = () => 0.99
  })
  await game.getByRole("button", { name: /レバー/ }).click()
  for (const name of ["右", "中", "左"]) await game.getByRole("button", { name: `${name}リール停止` }).click()
  await expect(game.getByLabel("残高 997ポイント")).toBeVisible()
  await dialog.getByRole("button", { name: "閉じる", exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await page.getByRole("button", { name: "スロットを開く" }).click()
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
  await page.setViewportSize({ width: 568, height: 320 })
  await game.getByRole("button", { name: "遊び方・配列表" }).click()
  await expect(page.getByRole("dialog", { name: "遊び方・配列表" })).toBeVisible()
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
  await expect(game.locator(".slot-mode")).toContainText("残り 50 G")
  await expect(game.locator(".slot-status")).toContainText("PAYOUT")
  await expect(game.locator(".slot-status")).toHaveScreenshot("slot-ambition.png")
  await expect(game.locator(".slot-mode")).toHaveScreenshot("slot-ambition-mode.png")
  await page.clock.runFor(10000)
  await expect(game.getByLabel("残高 1301ポイント")).toBeVisible()
})

test("slot displays REG and keeps the control panel usable while spinning", async ({ page }) => {
  const game = await openSlot(page)
  await page.clock.install({ time: new Date("2026-11-03T00:00:00Z") })
  await page.clock.pauseAt(new Date("2026-11-03T00:00:01Z"))
  await page.evaluate(() => {
    let count = 0
    Math.random = () => (count++ === 0 ? 0.004 : 0.99)
  })
  await game.getByRole("button", { name: /レバー/ }).click()
  await expect(game.getByRole("button", { name: /レバー/ })).toBeDisabled()
  await expect(game.getByRole("button", { name: "左リール停止" })).toBeEnabled()
  await expect(page).toHaveScreenshot("slot-spinning.png")
  await page.clock.runFor(400)
  await game.getByRole("button", { name: "右リール停止" }).click()
  await page.clock.runFor(288)
  for (const name of ["左", "中"]) await game.getByRole("button", { name: `${name}リール停止` }).click()
  await expect(game.locator(".slot-message")).toHaveText("REG 入賞！ 7・7・BAR")
  await page.clock.runFor(200)
  await expect(page).toHaveScreenshot("slot-reg.png")
})

test("slot game over retains retry and help controls", async ({ page }) => {
  test.setTimeout(90000)
  const game = await openSlot(page)
  await page.clock.install({ time: new Date("2026-11-03T00:00:00Z") })
  await page.clock.pauseAt(new Date("2026-11-03T00:00:01Z"))
  await page.evaluate(() => {
    Math.random = () => 0.99
    const lever = document.querySelector(".slot-handle")
    const stops = [...document.querySelectorAll(".slot-stop")]
    const timer = setInterval(() => {
      if (document.querySelector(".slot-over")) return clearInterval(timer)
      lever.click()
      setTimeout(() => stops.forEach((stop) => stop.click()), 100)
    }, 300)
  })
  await page.clock.runFor(101000)
  await expect(game.getByText("GAME OVER", { exact: true })).toBeVisible()
  await expect(game.getByRole("button", { name: "1,000ptでやり直す" })).toBeInViewport()
  await expect(page).toHaveScreenshot("slot-gameover.png")
  await game.getByRole("button", { name: "1,000ptでやり直す" }).click()
  await expect(game.getByLabel("残高 1000ポイント")).toBeVisible()
})
