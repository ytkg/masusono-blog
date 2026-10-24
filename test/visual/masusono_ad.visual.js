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
            missingViewerId: Array.from(document.querySelectorAll("[data-masusono-ad]")).some(
              (element) => !element.dataset.masusonoViewerId,
            ),
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
    const userId = (await page.context().cookies()).find((cookie) => cookie.name === "user_id")?.value
    expect(userId).toBeTruthy()
    await expect(ad).toHaveAttribute("data-masusono-viewer-id", userId)
    await expect(page.locator('script[src="https://ads.masusono.com/ad.js"]')).toHaveAttribute("defer", "")
    await expect
      .poll(() => page.evaluate(() => window.adSlots))
      .toEqual([{ missingViewerId: false, slots: [slot], url: path }])
    await expectNoPageOverflow(page)
    await page.getByRole("navigation").last().getByRole("link", { name: "ホーム", exact: true }).click()
    await expect(page.locator("[data-masusono-ad]")).toHaveCount(0)
    await page.evaluate(() => {
      document.cookie = "user_id=changed-viewer; Path=/; SameSite=Lax"
    })
    await page.getByRole("navigation").last().getByRole("link", { name: label, exact: true }).click()
    await expect
      .poll(() => page.evaluate(() => window.adSlots))
      .toEqual([
        { missingViewerId: false, slots: [slot], url: path },
        { missingViewerId: false, slots: [slot], url: path },
      ])
    await expect(ad).toHaveAttribute("data-masusono-viewer-id", "changed-viewer")
    if (slot === "search-bottom") {
      await page.getByRole("textbox", { name: "記事を検索" }).fill("散歩")
      await expect
        .poll(() => page.evaluate(() => window.adSlots.at(-1)))
        .toEqual({
          missingViewerId: false,
          slots: [],
          url: "/search?q=%E6%95%A3%E6%AD%A9",
        })
      await expect(ad).toHaveCount(0)
      await page.getByRole("button", { name: "検索語をクリア" }).click()
      await expect(ad).toHaveCount(1)
      await expect
        .poll(() => page.evaluate(() => window.adSlots.at(-1)))
        .toEqual({ missingViewerId: false, slots: [slot], url: path })
    }
  })
}
