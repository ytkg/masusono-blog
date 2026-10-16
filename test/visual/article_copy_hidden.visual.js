import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("copying a full article omits hidden subtrees and preserves visible text", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text) => {
          window.copiedArticleText = text
        },
      },
    })
  })
  await mockPageProps(page, "/search", (props) => {
    props.articles = [
      {
        id: "visual-article-1",
        title: "hidden-copy",
        content:
          '<p>本文<span hidden>非表示<strong>子孫</strong></span><span aria-hidden="true">視覚</span></p><div hidden="false">非表示段落</div><div hidden="until-found">検索前は非表示</div><pre><code>  puts 1</code></pre>',
      },
    ]
  })
  await openPage(page, "/search?q=hidden-copy")
  await page.getByRole("button", { name: "記事メニューを開く" }).click()
  await page.getByRole("menuitem", { name: "記事全文をコピー" }).click()
  await expect(page.getByText("記事全文をコピーしました")).toBeVisible()
  expect(await page.evaluate(() => window.copiedArticleText)).toBe("hidden-copy\n\n本文視覚\n\n  puts 1")
})
