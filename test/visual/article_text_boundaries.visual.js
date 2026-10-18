import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text) => { window.copiedText = text } } })
  })
})

test("semantic block boundaries are searchable and copied as separate lines", async ({ page }) => {
  await mockPageProps(page, "/search", (props) => {
    props.articles = [{ id: "visual-article-1", title: "boundary", content: "<section>前</section><section>中</section><dl><dt>用語</dt><dd>意味</dd></dl>" }]
  })
  await openPage(page, "/search?q=%22前%20中%22")
  await expect(page.getByRole("link", { name: "boundary", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "記事メニューを開く" }).click()
  await page.getByRole("menuitem", { name: "記事全文をコピー" }).click()
  expect(await page.evaluate(() => window.copiedText)).toBe("boundary\n\n前\n\n中\n\n用語\n\n意味")
})
