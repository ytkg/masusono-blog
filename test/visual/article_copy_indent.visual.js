import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("full article copy keeps leading indentation and trailing preformatted whitespace", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text) => { window.copiedText = text } } })
  })
  await mockPageProps(page, "/search", (props) => {
    props.articles = [{ id: "visual-article-1", title: "indent-copy", content: "<pre><code>  puts 1\n\tputs 2  \n</code></pre>" }]
  })
  await openPage(page, "/search?q=indent-copy")
  await page.getByRole("button", { name: "記事メニューを開く" }).click()
  await page.getByRole("menuitem", { name: "記事全文をコピー" }).click()
  expect(await page.evaluate(() => window.copiedText)).toBe("indent-copy\n\n  puts 1\n\tputs 2  \n")
})
