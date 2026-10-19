import { expect, test } from "@playwright/test"
import { openPage, expectNoPageOverflow } from "./helpers"

test("logo setting persists through reload, navigation and SSR", async ({ page }) => {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|hydrating|didn't match|Minified React error/i.test(message.text()))
      errors.push(message.text())
  })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: async () => ({}),
        ready: Promise.resolve({ pushManager: { getSubscription: async () => null } }),
      },
    })
  })
  await page
    .context()
    .addCookies([{ name: "user_id", value: "11111111-1111-4111-8111-111111111111", url: "http://localhost:3000" }])
  await openPage(page, "/others")
  const logo = page.locator('header img[aria-hidden="false"]')
  await expect(logo).toHaveAttribute("alt", "増田とその他！")
  await page.getByRole("button", { name: "設定を開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  const toggle = page.getByRole("switch", { name: "期間限定ロゴ", exact: true })
  await expect(toggle).not.toBeChecked()
  await toggle.click()
  await expect(toggle).toBeChecked()
  await expect(logo).toHaveAttribute("alt", "増田とその他！と、私の体調")
  const cookie = (await page.context().cookies()).find(({ name }) => name === "seasonal_logo_20261018_autumn_health")
  expect(cookie).toMatchObject({ value: "on", path: "/", sameSite: "Lax" })
  await expect(page).toHaveScreenshot("settings-seasonal-logo-on.png")
  await page.reload()
  await expect(logo).toHaveAttribute("alt", "増田とその他！と、私の体調")
  await openPage(page, "/articles/visual-article-1")
  await expect(logo).toHaveAttribute("alt", "増田とその他！と、私の体調")
  const onHtml = await page.request.get("/articles/visual-article-1")
  expect(await onHtml.text()).toContain('alt="増田とその他！と、私の体調"')
  await page.getByRole("link", { name: "ホーム", exact: true }).click()
  await expect(page.getByRole("tab", { name: "フィード", exact: true })).toBeVisible()
  await expect(logo).toHaveAttribute("alt", "増田とその他！と、私の体調")
  await openPage(page, "/others")
  await page.getByRole("button", { name: "設定を開く" }).click()
  await expect(toggle).toBeChecked()
  await toggle.click()
  await expect(toggle).not.toBeChecked()
  await expect(logo).toHaveAttribute("alt", "増田とその他！")
  await expect(page).toHaveScreenshot("settings-seasonal-logo-off.png")
  await page.reload()
  await openPage(page, "/articles/visual-article-1")
  await expect(logo).toHaveAttribute("alt", "増田とその他！")
  const offHtml = await page.request.get("/articles/visual-article-1")
  expect(await offHtml.text()).toContain('alt="増田とその他！"')
  expect(await offHtml.text()).not.toContain('alt="増田とその他！と、私の体調"')
  await expectNoPageOverflow(page)
  expect(errors).toEqual([])
})
