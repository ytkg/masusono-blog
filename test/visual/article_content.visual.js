import { expect, test } from "@playwright/test"
import { richArticleContent, richArticleTitle } from "./contentFixtures"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("rich article content", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.title = richArticleTitle
    props.article.content = richArticleContent
  })
  await openPage(page, "/articles/visual-article-1")
  // Wait for the lazy structured renderer, rather than photographing its raw HTML fallback.
  await expect(page.locator("[data-code-block-shell]")).toHaveCount(2)
  await expect(page.getByRole("button", { name: "▶ 実行" })).toBeVisible()
  await expect(page.getByRole("heading", { name: richArticleTitle, level: 1 })).toBeVisible()
  await expectNoPageOverflow(page)
  await expect.soft(page).toHaveScreenshot("rich-article-initial.png")
  // Content crops must not be obscured by fixed UI; the initial screenshot retains it.
  await page.addStyleTag({ content: 'header, nav[aria-label="メインナビゲーション"] { visibility: hidden; }' })

  const prose = page.locator("#visual-prose")
  await expect(prose.getByRole("list")).toHaveCount(2)
  await expect.soft(prose).toHaveScreenshot("rich-article-prose.png")

  const image = page.getByRole("img", { name: "散歩記事の固定画像" })
  await image.scrollIntoViewIfNeeded()
  await image.evaluate((element) => element.decode())
  await expect.soft(page.locator("#visual-image")).toHaveScreenshot("rich-article-image.png")

  const code = page.locator("[data-code-block-shell]").first()
  await expect(code.locator("[data-code-language-label]")).toHaveText("JavaScript")
  await expect.soft(code).toHaveScreenshot("rich-article-code.png")
  await expect.soft(page.getByTestId("ruby-code-runner")).toHaveScreenshot("rich-article-ruby.png")
  await expectNoPageOverflow(page)
})
