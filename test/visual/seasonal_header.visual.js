import { test, expect } from "@playwright/test"
import { openPage, expectNoPageOverflow } from "./helpers"

for (const width of [320, 390, 1280]) {
  test(`seasonal header ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop")
    await page.setViewportSize({ width, height: 844 })
    await page.context().addCookies([{ name: "seasonal_logo_20261018_autumn_health", value: "on", url: "http://localhost:3000" }])
    for (const path of ["/", "/articles/visual-article-1", "/search?q=散歩"]) {
      await openPage(page, path)
      const header = page.locator("header")
      const logo = header.getByRole("img", { name: "増田とその他！と、私の体調", exact: true })
      await expect(logo).toBeVisible()
      await expect(logo.locator("..")).toHaveAttribute("href", "/")
      await logo.evaluate((image) => image.decode())
      const image = await logo.boundingBox()
      const bar = await header.boundingBox()
      expect(bar.height).toBe(width < 600 ? 45 : 55)
      expect(image.height).toBe(width < 600 ? 40 : 48)
      expect(image.width / image.height).toBeCloseTo(3375 / 719, 2)
      expect(image.x).toBeGreaterThanOrEqual(0)
      expect(image.x + image.width).toBeLessThanOrEqual(width)
      const back = header.getByRole("button", { name: "前のページに戻る" })
      if (path !== "/") {
        await expect(back).toBeVisible()
        const button = await back.boundingBox()
        expect(button.x + button.width).toBeLessThanOrEqual(image.x)
      }
      await expectNoPageOverflow(page)
      if (width === 320) await expect(header).toHaveScreenshot(`seasonal-header-${path === "/" ? "home" : path.startsWith("/articles") ? "article" : "search"}-320.png`)
    }
  })
}
