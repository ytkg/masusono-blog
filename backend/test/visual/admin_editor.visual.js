import { expect, test } from "@playwright/test"
import { mockAdminArticles } from "./adminFixtures"
import { expectNoPageOverflow, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

const initial = {
  id: "visual-published", title: "散歩の記録", content: "<h2>寄り道の発見</h2><p>いつもの道で<strong>新しい景色</strong>を見つけました。</p><ul><li>公園を歩く</li><li>写真を撮る</li></ul>",
  author_id: "visual-author", published_at: "2026-01-15T03:00:00Z", status: "PUBLISH", editable: true, content_editable: true, revision: "revision-1",
}
const authors = [{ id: "visual-author", name: "記録係" }]

async function openEditor(page, overrides = {}, saveError = null) {
  await mockAdminArticles(page)
  let article = { ...initial, ...overrides }
  await page.route("**/api/app/management/articles/visual-published", async (route) => {
    if (route.request().method() === "PATCH") {
      if (saveError) return route.fulfill({ status: 409, json: { error: { code: "article_conflict", message: "記事が別の場所で更新されています。入力内容を控えてから再読み込みしてください。" } } })
      const changes = route.request().postDataJSON().article
      article = { ...article, ...changes, revision: "revision-2" }
    }
    return route.fulfill({ json: { article, authors } })
  })
  await openPage(page, "/others")
  await page.getByRole("button", { name: "管理を開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await page.getByRole("textbox", { name: "ユーザー名" }).fill("visual-owner")
  await page.getByLabel("パスワード").fill("visual-password")
  await page.getByRole("button", { name: "ログイン", exact: true }).click()
  await page.getByRole("button", { name: "記事一覧へ" }).click()
  await page.getByRole("listitem").first().getByRole("button").click()
  await expect(page.getByRole("heading", { name: "記事の編集" })).toBeVisible()
  await expect(page.getByRole("textbox", { name: "タイトル" })).toHaveValue(article.title)
}

test("admin article editor and preview", async ({ page }) => {
  await openEditor(page)
  await expect(page.getByRole("textbox", { name: "本文" })).toBeVisible()
  await expectNoPageOverflow(page)
  await expect(page).toHaveScreenshot("admin-article-editor.png")
  await page.getByRole("tab", { name: "プレビュー" }).click()
  await expect(page.getByRole("heading", { name: "寄り道の発見" })).toBeVisible()
  await expect(page).toHaveScreenshot("admin-article-preview.png")
})

test("admin article save conflict preserves changes", async ({ page }) => {
  await openEditor(page, {}, true)
  await page.getByRole("textbox", { name: "タイトル" }).fill("更新中の記録")
  await page.getByRole("button", { name: "保存", exact: true }).click()
  await expect(page.getByText("公開中の記事への変更は即時反映されます。", { exact: false })).toBeVisible()
  await expect(page).toHaveScreenshot("admin-article-save-confirm.png")
  await page.getByRole("button", { name: "保存する" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "別の場所で更新" })).toBeInViewport()
  await expect(page.getByRole("textbox", { name: "タイトル" })).toHaveValue("更新中の記録")
  await expect(page.getByRole("button", { name: "保存", exact: true })).toBeDisabled()
  await expect(page).toHaveScreenshot("admin-article-save-conflict.png")
})

test("admin editor markdown image save and list state", async ({ page }) => {
  await openEditor(page, { content: "<p></p>" })
  const body = page.getByRole("textbox", { name: "本文" })
  await body.click()
  await page.keyboard.type("## ")
  await page.keyboard.type("Markdown の見出し")
  await expect(body.locator("h2")).toHaveText("Markdown の見出し")
  await page.keyboard.press("Enter")
  await page.getByRole("button", { name: "画像", exact: true }).click()
  const picker = page.getByRole("dialog", { name: "画像を選択" })
  await picker.getByRole("button", { name: /の詳細を表示/ }).first().click()
  await expect(body.getByRole("img")).toHaveCount(1)
  await page.getByRole("button", { name: "保存", exact: true }).click()
  const saved = page.waitForRequest((request) => request.method() === "PATCH" && request.url().endsWith("/visual-published"))
  await page.getByRole("button", { name: "保存する" }).click()
  const savedHtml = (await saved).postDataJSON().article.content
  expect(savedHtml).toContain("<h2>Markdown の見出し</h2>")
  expect(savedHtml.match(/<img /g)).toHaveLength(1)
  await expect(page.getByRole("alert")).toContainText("保存しました")
  await expect(page.getByRole("button", { name: "保存", exact: true })).toBeDisabled()
  await page.getByRole("button", { name: "記事一覧へ戻る", exact: true }).click()
  await expect(page.getByRole("textbox", { name: "タイトルで検索" })).toBeVisible()
})

test("admin editor asks before discarding changes", async ({ page }) => {
  await openEditor(page)
  await page.getByRole("textbox", { name: "タイトル" }).fill("保存前のタイトル")
  page.once("dialog", (dialog) => dialog.dismiss())
  await page.getByRole("button", { name: "記事一覧へ戻る", exact: true }).click()
  await expect(page.getByRole("textbox", { name: "タイトル" })).toHaveValue("保存前のタイトル")
  page.once("dialog", (dialog) => dialog.dismiss())
  await page.getByRole("button", { name: "閉じる", exact: true }).click()
  await expect(page.getByRole("heading", { name: "記事の編集" })).toBeVisible()
  page.once("dialog", (dialog) => dialog.accept())
  await page.getByRole("button", { name: "記事一覧へ戻る", exact: true }).click()
  await expect(page.getByRole("textbox", { name: "タイトルで検索" })).toBeVisible()
})
