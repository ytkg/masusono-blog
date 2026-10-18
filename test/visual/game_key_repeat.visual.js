import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

test("holding Space on the RUN canvas does not hand repeats to native scrolling", async ({ page }) => {
  await openPage(page, "/others")
  await page.getByRole("button", { name: "増田RUNを開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await page.getByRole("img", { name: "増田RUNのゲーム画面" }).focus()
  await page.evaluate(() => {
    window.repeatedKey = null
    window.addEventListener("keydown", (event) => {
      if (event.repeat && event.key === " ") window.repeatedKey = event
    })
  })
  await page.keyboard.down("Space")
  await page.keyboard.down("Space")
  await page.keyboard.up("Space")
  expect(await page.evaluate(() => window.repeatedKey?.defaultPrevented)).toBe(true)
})
