import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

const articlePath = "/articles/1cxjrah487"
const limitedAlt = "増田とその他！と、私の体調"
const normalAlt = "増田とその他！"

for (const width of [320, 390, 1280]) {
  test(`designated article logo with setting off at ${width}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop")
    await page.setViewportSize({ width, height: 844 })
    await page
      .context()
      .addCookies([{ name: "seasonal_logo_20261018_autumn_health", value: "off", url: "http://localhost:3000" }])
    await openPage(page, `${articlePath}?from=home#body`)
    const header = page.locator("header")
    const image = header.locator('img[aria-hidden="false"]')
    await expect(image).toHaveAttribute("alt", limitedAlt)
    await image.evaluate((element) => element.decode())
    const logo = await image.boundingBox()
    const back = await header.getByRole("button", { name: "前のページに戻る" }).boundingBox()
    expect((await header.boundingBox()).height).toBe(width < 600 ? 45 : 55)
    expect(logo.height).toBe(width < 600 ? 40 : 48)
    expect(logo.width / logo.height).toBeCloseTo(3375 / 719, 2)
    expect(back.x + back.width).toBeLessThanOrEqual(logo.x)
    expect(logo.x + logo.width).toBeLessThanOrEqual(width)
    await expect(header.getByRole("link", { name: limitedAlt, exact: true })).toHaveAttribute("href", "/")
    await expectNoPageOverflow(page)
    await expect(page).toHaveScreenshot(`designated-article-logo-${width}.png`)
    await page.reload()
    await expect(image).toHaveAttribute("alt", limitedAlt)
    const html = await (await page.request.get(articlePath)).text()
    expect(html).toContain(`alt="${limitedAlt}"`)
    for (const path of ["/", "/search", "/authors/visual-author-2", "/articles/visual-article-2"]) {
      await openPage(page, path)
      await expect(image).toHaveAttribute("alt", normalAlt)
    }
  })
}

test("article logo follows Inertia navigation and browser back/forward", async ({ page }) => {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|hydrating|didn't match|Minified React error/i.test(message.text()))
      errors.push(message.text())
  })
  await mockPageProps(page, "/", (props) => {
    props.articles[1].id = "1cxjrah487"
    props.articles[1].title = "私に秋服を着させてくれ"
  })
  await openPage(page, "/")
  const logo = page.locator('header img[aria-hidden="false"]')
  await expect(logo).toHaveAttribute("alt", normalAlt)
  await page.getByRole("link", { name: "私に秋服を着させてくれ", exact: true }).click()
  await expect(page).toHaveURL(articlePath)
  await expect(logo).toHaveAttribute("alt", limitedAlt)
  await page.getByRole("link", { name: "ホーム", exact: true }).click()
  await expect(page).toHaveURL("/")
  await expect(logo).toHaveAttribute("alt", normalAlt)
  await page.goBack()
  await expect(page).toHaveURL(articlePath)
  await expect(logo).toHaveAttribute("alt", limitedAlt)
  await page.goForward()
  await expect(page).toHaveURL("/")
  await expect(logo).toHaveAttribute("alt", normalAlt)
  expect(errors).toEqual([])
})
