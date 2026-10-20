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
  await expect(page.getByText("100点", { exact: true })).toBeVisible()
  await emptyHole.dispatchEvent("pointerdown", { button: 0 })
  await expect(page.getByText("100点", { exact: true })).toBeVisible()
})
