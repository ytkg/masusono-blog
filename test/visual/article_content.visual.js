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

test("structured code retains nested article markup", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.content = '<blockquote cite="/about"><ol start="3"><li id="nested-code">前文<pre><code class="language-js">const n = 1</code></pre><p>後文</p></li></ol></blockquote>'
  })
  await openPage(page, "/articles/visual-article-1")
  await expect(page.locator("[data-code-block-shell]")).toHaveCount(1)
  const item = page.locator("blockquote[cite='/about'] ol[start='3'] #nested-code")
  const code = item.locator("[data-code-block-shell]")
  await expect(code).toBeVisible()
  await expect(item.locator("p")).toHaveText("後文")
  const quoteBounds = await page.locator("blockquote").boundingBox()
  const codeBounds = await code.boundingBox()
  expect(codeBounds.x).toBeGreaterThanOrEqual(quoteBounds.x)
  expect(codeBounds.x + codeBounds.width).toBeLessThanOrEqual(quoteBounds.x + quoteBounds.width + 1)
  await expectNoPageOverflow(page)
})

test("article tags keep one search link per label in first-seen order", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.tags = " Ruby, Rails, Ruby , , ruby, Rails, Ruby on Rails, Ruby on Rails "
  })
  await openPage(page, "/articles/visual-article-1")
  const links = page.getByTestId("article-tags").getByRole("link")
  await expect(links).toHaveText(["#Ruby", "#Rails", "#ruby", "#Ruby on Rails"])
  await expect(links.last()).toHaveAttribute("href", "/search?q=%23%22Ruby%20on%20Rails%22")
  await links.last().click()
  await expect(page.getByRole("textbox", { name: "記事を検索" })).toHaveValue('#"Ruby on Rails"')
  await expectNoPageOverflow(page)
})
