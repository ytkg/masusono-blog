import { expect, test } from "@playwright/test"
import { adminArticles, mockAdminArticles } from "./adminFixtures"
import { expectNoPageOverflow, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

async function openAdmin(page) {
  await openPage(page, "/others")
  await page.getByRole("button", { name: "管理を開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await expect(page.getByRole("heading", { name: "ログイン", exact: true })).toBeVisible()
}

async function loginAdmin(page) {
  await openAdmin(page)
  await page.getByRole("textbox", { name: "ユーザー名" }).fill("visual-owner")
  await page.getByLabel("パスワード").fill("visual-password")
  await page.getByRole("button", { name: "ログイン", exact: true }).click()
  await expect(page.getByRole("button", { name: "記事一覧へ" })).toBeVisible()
}

test("admin article statuses and titles", async ({ page }) => {
  await mockAdminArticles(page)
  await loginAdmin(page)
  await page.getByRole("button", { name: "記事一覧へ" }).click()
  const rows = page.getByRole("dialog", { name: "管理", exact: true }).getByRole("listitem")
  await expect(rows).toHaveCount(4)
  for (const [index, label] of ["公開中", "下書き", "公開中・下書きあり", "公開終了"].entries()) {
    await expect(rows.nth(index).getByText(label, { exact: true })).toBeVisible()
  }
  const title = page.getByText(adminArticles[0].title, { exact: true })
  expect(await title.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  await expect(rows.nth(2).getByText("（タイトルなし）", { exact: true })).toBeVisible()
  await expectNoPageOverflow(page)
  await expect(page).toHaveScreenshot("admin-article-statuses.png")
})

test("admin article search without results", async ({ page }) => {
  await mockAdminArticles(page)
  await loginAdmin(page)
  await page.getByRole("button", { name: "記事一覧へ" }).click()
  await expect(page.getByText("4件", { exact: true })).toBeVisible()
  await page.getByRole("textbox", { name: "タイトルで検索" }).fill("該当しないタイトル")
  await page.getByRole("button", { name: "検索", exact: true }).click()
  await expect(page.getByText("0件", { exact: true })).toBeVisible()
  await expect(page.getByText("記事が見つかりませんでした。")).toBeVisible()
  await expect(page.getByRole("listitem")).toHaveCount(0)
  await expect(page).toHaveScreenshot("admin-article-search-empty.png")
})

test("admin media without results", async ({ page }) => {
  await page.route("**/api/app/management/media?*", (route) =>
    route.fulfill({ json: { media: [], total_count: 0, page: 1, has_more: false, next_token: null } }),
  )
  await loginAdmin(page)
  await page.getByRole("button", { name: "メディア一覧へ" }).click()
  await expect(page.getByText("0件", { exact: true })).toBeVisible()
  await expect(page.getByText("メディアが見つかりませんでした。")).toBeVisible()
  await expect(page.getByRole("alert")).toHaveCount(0)
  await expect(page).toHaveScreenshot("admin-media-empty.png")
})

test("admin invalid credentials", async ({ page }) => {
  await openAdmin(page)
  await page.getByRole("textbox", { name: "ユーザー名" }).fill("visual-owner")
  await page.getByLabel("パスワード").fill("visual-invalid-password")
  const response = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === "/api/app/management/session" && response.request().method() === "POST",
  )
  await page.getByRole("button", { name: "ログイン", exact: true }).click()
  expect((await response).status()).toBe(401)
  await expect(page.getByRole("alert")).toHaveText("失敗：ユーザー名またはパスワードが正しくありません。")
  await expect(page.getByRole("button", { name: "ログイン", exact: true })).toBeEnabled()
  await expect(page).toHaveScreenshot("admin-invalid-credentials.png")
})
