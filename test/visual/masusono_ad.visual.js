import { test, expect } from "@playwright/test"
import { openPage, expectNoPageOverflow } from "./helpers"

test("Masusono ad initializes on direct load and SPA navigation", async ({ page }) => {
  await page.addInitScript(() => {
    window.adSlots = []
    window.MasusonoAds = {
      render() {
        window.adSlots.push(document.querySelectorAll('[data-masusono-ad="others-bottom"]').length)
      },
    }
  })
  await openPage(page, "/others")
  await expect(page.locator('[data-masusono-ad="others-bottom"]')).toHaveCount(1)
  await expect(page.locator('script[src="https://ads.masusono.com/ad.js"]')).toHaveAttribute("defer", "")
  await expect.poll(() => page.evaluate(() => window.adSlots)).toEqual([1])
  await expectNoPageOverflow(page)
  await page.getByRole("navigation").last().getByRole("link", { name: "ホーム", exact: true }).click()
  await expect(page.locator('[data-masusono-ad="others-bottom"]')).toHaveCount(0)
  await page.getByRole("navigation").last().getByRole("link", { name: "その他！", exact: true }).click()
  await expect.poll(() => page.evaluate(() => window.adSlots)).toEqual([1, 1])
})
