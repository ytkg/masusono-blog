import { test, expect } from "@playwright/test"
import { openPage, expectNoPageOverflow } from "./helpers"

for (const [path, slot, label] of [
  ["/others", "others-bottom", "その他！"],
  ["/search", "search-bottom", "検索"],
  ["/numbers", "numbers-bottom", "数字"],
]) {
  test(`Masusono ad initializes on direct load and SPA navigation: ${slot}`, async ({ page }) => {
    await page.addInitScript(() => {
      window.adSlots = []
      window.MasusonoAds = {
        render() {
          window.adSlots.push({
            slots: Array.from(document.querySelectorAll("[data-masusono-ad]")).map(
              (element) => element.dataset.masusonoAd,
            ),
            url: window.location.pathname + window.location.search,
          })
        },
      }
    })
    await openPage(page, path)
    const ad = page.locator(`[data-masusono-ad="${slot}"]`)
    await expect(ad).toHaveCount(1)
    await expect(page.locator('script[src="https://ads.masusono.com/ad.js"]')).toHaveAttribute("defer", "")
    await expect.poll(() => page.evaluate(() => window.adSlots)).toEqual([{ slots: [slot], url: path }])
    await expectNoPageOverflow(page)
    await page.getByRole("navigation").last().getByRole("link", { name: "ホーム", exact: true }).click()
    await expect(page.locator("[data-masusono-ad]")).toHaveCount(0)
    await page.getByRole("navigation").last().getByRole("link", { name: label, exact: true }).click()
    await expect.poll(() => page.evaluate(() => window.adSlots)).toEqual([
      { slots: [slot], url: path },
      { slots: [slot], url: path },
    ])
    if (slot === "search-bottom") {
      await page.getByRole("textbox", { name: "記事を検索" }).fill("散歩")
      await expect.poll(() => page.evaluate(() => window.adSlots.at(-1))).toEqual({
        slots: [],
        url: "/search?q=%E6%95%A3%E6%AD%A9",
      })
      await expect(ad).toHaveCount(0)
      await page.getByRole("button", { name: "検索語をクリア" }).click()
      await expect(ad).toHaveCount(1)
      await expect.poll(() => page.evaluate(() => window.adSlots.at(-1))).toEqual({ slots: [slot], url: path })
    }
  })
}
