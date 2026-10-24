import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("Tataki only scores characters already displayed when a tap starts", async ({ page }) => {
  await openPage(page, "/others")
  await page.getByRole("button", { name: "増田たたきを開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await expect(page.getByRole("button", { name: "スタート", exact: true })).toBeEnabled()
  await page.clock.install()
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
  await page.evaluate(() => {
    Math.random = () => 0
  })
  await page.getByRole("button", { name: "スタート", exact: true }).click()
  await page.clock.runFor(3000)
  const emptyHole = page.getByRole("button", { name: "穴1", exact: true })
  await expect(emptyHole).toBeVisible()
  await emptyHole.dispatchEvent("pointerdown", { button: 0 })
  await expect(page.getByText("0点", { exact: true })).toBeVisible()
  const character = page.getByRole("button", { name: "穴1 増田", exact: true })
  await expect(character).toBeVisible()
  await character.dispatchEvent("pointerdown", { button: 0 })
  await expect(page.getByText("150点", { exact: true })).toBeVisible()
  await emptyHole.dispatchEvent("pointerdown", { button: 0 })
  await expect(page.getByText("150点", { exact: true })).toBeVisible()
})


test("Tataki fast hits and recurring combo bonuses", async ({ page }) => {
  await openPage(page, "/others")
  await page.getByRole("button", { name: "増田たたきを開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await expect(page.getByRole("button", { name: "スタート", exact: true })).toBeEnabled()
  await page.clock.install()
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000))
  await page.evaluate(() => { Math.random = () => 0 })
  await page.getByRole("button", { name: "スタート", exact: true }).click()
  await page.clock.runFor(3030)
  for (let combo = 1; combo <= 10; combo++) {
    await page.getByRole("button", { name: "穴1 増田", exact: true }).dispatchEvent("pointerdown", { button: 0 })
    await expect(page.getByText(`${combo}コンボ`, { exact: true })).toBeVisible()
    await expect(page.getByText("早い！＋150", { exact: true })).toBeVisible()
    if (combo === 5 || combo === 10) {
      const bonus = combo === 5 ? 200 : 500
      await expect(page.getByText(`コンボ＋${bonus}`, { exact: true })).toBeVisible()
      await expect(page.getByText(combo === 5 ? "950点" : "2200点", { exact: true })).toBeVisible()
      await expect.soft(page).toHaveScreenshot(`tataki-combo-${combo}.png`)
    }
    if (combo < 10) await page.clock.runFor(900)
  }
  await page.evaluate(() => {
    let calls = 0
    Math.random = () => calls++ % 3 === 1 ? 0.99 : 0
  })
  await page.clock.runFor(900)
  await page.getByRole("button", { name: "穴1 その他", exact: true }).dispatchEvent("pointerdown", { button: 0 })
  await expect(page.getByText("2200点", { exact: true })).toBeVisible()
  await expect(page.getByText("0コンボ", { exact: true })).toBeVisible()
  await expect(page.getByText("次のボーナスまであと5回（＋200点）", { exact: true })).toBeVisible()
  await expect(page.getByText("コンボ終了", { exact: true })).toBeVisible()
  await expect.soft(page).toHaveScreenshot("tataki-combo-reset.png")
  await page.evaluate(() => { Math.random = () => 0 })
  await page.clock.runFor(1230)
  await page.getByRole("button", { name: "穴1 増田", exact: true }).dispatchEvent("pointerdown", { button: 0 })
  await expect(page.getByText("2300点", { exact: true })).toBeVisible()
  await expect(page.getByText("＋100", { exact: true })).toBeVisible()
  await expect.soft(page).toHaveScreenshot("tataki-normal-hit.png")

})
