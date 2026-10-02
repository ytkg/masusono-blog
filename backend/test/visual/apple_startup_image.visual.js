import { expect, test } from "@playwright/test"

for (const orientation of ["portrait", "landscape"]) {
  test(`Apple startup image matches the current device in ${orientation}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      baseURL,
      viewport: orientation === "portrait" ? { width: 402, height: 874 } : { width: 874, height: 402 },
      screen: { width: 402, height: 874 },
      deviceScaleFactor: 3,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 27_0 like Mac OS X) AppleWebKit/605.1.15",
    })
    try {
      const page = await context.newPage()
      await page.goto("/")
      await page.locator("main").waitFor()
      const images = page.locator('link[rel="apple-touch-startup-image"]')
      await expect(images).toHaveCount(1)
      await expect(images).toHaveAttribute("href", new RegExp(`iPhone_17_Pro__iPhone_17__iPhone_16_Pro_${orientation}\\.png$`))
      expect(await images.getAttribute("media")).toBeNull()
    } finally {
      await context.close()
    }
  })
}
