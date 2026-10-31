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
    await page.route("https://ads.masusono.com/**", (route) => route.fulfill({ contentType: "text/html; charset=utf-8", body: "<h1>広告の新規出稿画面</h1>" }))
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
    const frame = page.getByTitle("広告を出稿する", { exact: true })
    await expect(frame).toHaveAttribute(
      "src",
      `https://ads.masusono.com/users/${encodeURIComponent(userId)}/ads/new?articleId=${encodeURIComponent(articleId)}`,
    )
    await expect(page.frameLocator('iframe[title="広告を出稿する"]').getByRole("heading")).toHaveText("広告の新規出稿画面")
    await expect(page).toHaveURL(/\/search\?q=/)
    expect(context.pages()).toHaveLength(1)
    await expect(page.getByRole("button", { name: "閉じる", exact: true })).toBeVisible()
    if (!existingId) await expect(page).toHaveScreenshot("article-ad-dialog.png")
    await page.getByRole("button", { name: "閉じる", exact: true }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible()
    await expect(menu).toBeFocused()
    await menu.click()
    await page.getByRole("menuitem", { name: "広告を出稿する" }).click()
    await expect(frame).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).not.toBeVisible()
    await expect(menu).toBeFocused()
  })
}

test("article ad submission explains unavailable cookies", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(document, "cookie", { get: () => "", set: () => {} }))
  await openPage(page, "/search?q=散歩")
  await page.getByRole("button", { name: "記事メニューを開く" }).first().click()
  await page.getByRole("menuitem", { name: "広告を出稿する" }).click()
  await expect(page.getByRole("status")).toContainText("ブラウザのCookie設定を確認してください。")
  await expect(page).toHaveURL(/\/search\?q=/)
  await expect(page).toHaveScreenshot("article-ad-cookie-error.png")
})
