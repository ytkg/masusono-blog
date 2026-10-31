import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

for (const existingId of [null, "existing/id ?広告"]) {
  test(`article ad submission uses browser ID: ${existingId ?? "first visit"}`, async ({ page, context }) => {
    if (existingId) {
      await context.addCookies([{ name: "user_id", value: encodeURIComponent(existingId), url: "http://localhost:3000" }])
    }
    const articleId = "article/id ?記事&other=value"
    await mockPageProps(page, "/search", (props) => {
      props.articles[0].id = articleId
    })
    await page.route("https://ads.masusono.com/**", (route) => route.fulfill({ body: "広告の新規出稿画面" }))
    await openPage(page, "/search?q=散歩")
    const userId = decodeURIComponent((await context.cookies()).find((cookie) => cookie.name === "user_id").value)
    if (existingId) expect(userId).toBe(existingId)
    else expect(userId).toMatch(/^[0-9a-f-]{36}$/i)
    const menu = page.getByRole("button", { name: "記事メニューを開く" }).first()
    await menu.focus()
    await page.keyboard.press("Enter")
    await page.keyboard.press("End")
    await expect(page.getByRole("menuitem", { name: "広告を出稿する" })).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(
      `https://ads.masusono.com/users/${encodeURIComponent(userId)}/ads/new?articleId=${encodeURIComponent(articleId)}`,
    )
    expect(context.pages()).toHaveLength(1)
  })
}

test("article ad submission explains unavailable cookies", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(document, "cookie", { get: () => "", set: () => {} }))
  await openPage(page, "/search?q=散歩")
  await page.getByRole("button", { name: "記事メニューを開く" }).first().click()
  await page.getByRole("menuitem", { name: "広告を出稿する" }).click()
  await expect(page.getByRole("alert")).toContainText("ブラウザのCookie設定を確認してください。")
  await expect(page).toHaveURL(/\/search\?q=/)
  await expect(page).toHaveScreenshot("article-ad-cookie-error.png")
})
