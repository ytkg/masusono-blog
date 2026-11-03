import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

test("back from a directly opened article falls back to home when there is no previous page", async ({ page }) => {
  await openPage(page, "/articles/visual-article-2")
  await page.evaluate(() => Object.defineProperty(window.history, "length", { get: () => 1 }))
  await page.getByRole("button", { name: "前のページに戻る" }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole("tab", { name: "フィード", exact: true })).toBeVisible()
})
