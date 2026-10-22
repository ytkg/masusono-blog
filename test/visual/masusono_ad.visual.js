import { test, expect } from "@playwright/test"
import { openPage, expectNoPageOverflow } from "./helpers"

for (const width of [320, 390, 1280]) {
  test(`fixed Masusono ad at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await openPage(page, "/others")
    const ad = page.getByRole("article", { name: "Masusono Ads", exact: true })
    await expect(ad).toHaveCount(1)
    const image = ad.getByRole("img")
    await expect(image).toHaveAttribute("alt", "パインを載せたハンバーグとご飯の水彩画")
    await image.evaluate((element) => element.decode())
    const imageBox = await image.boundingBox()
    expect(imageBox.width / imageBox.height).toBeCloseTo(1280 / 800, 2)
    const link = ad.getByRole("link", { name: "記事を読む" })
    await expect(link).toHaveAttribute("href", "/articles/zm5_f8m7vw")
    await link.focus()
    await expect(link).toBeFocused()
    await ad.scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await expectNoPageOverflow(page)
    const box = await link.boundingBox()
    expect(box.height).toBeGreaterThanOrEqual(44)
    // The CTA must remain above the fixed bottom navigation after scrolling.
    const navigation = await page.getByRole("navigation").last().boundingBox()
    expect(box.y + box.height).toBeLessThanOrEqual(navigation.y)
    await expect(ad).toHaveScreenshot(`masusono-ad-${width}.png`)
    await page.reload()
    await expect(ad).toHaveCount(1)
    await expect(link).toHaveAttribute("href", "/articles/zm5_f8m7vw")
    await page.route("**/articles/zm5_f8m7vw", (route) =>
      route.fulfill({ contentType: "text/html", body: "<h1>パインバーグディッシュ</h1>" }),
    )
    await link.focus()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/articles\/zm5_f8m7vw$/)
  })
}
