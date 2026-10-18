import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("long author text wraps in lists, article details and author profiles", async ({ page }) => {
  const name = "LongAuthorName".repeat(16)
  const article = { id: "visual-article-1", title: "wrap", author: name, authorId: "visual-author-1", content: "<p>本文</p>" }
  await mockPageProps(page, "/search", (props) => { props.articles = [article] })
  await mockPageProps(page, "/articles/visual-article-1", (props) => { props.article = article })
  await mockPageProps(page, "/authors", (props) => {
    props.authors = [{ id: "visual-author-1", name, title: "LongTitle".repeat(20), bio: "https://example.test/" + "profile".repeat(50) }]
  })
  for (const path of ["/search?q=wrap", "/articles/visual-article-1", "/authors"]) {
    await openPage(page, path)
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible()
    await expectNoPageOverflow(page)
    const menu = page.getByRole("button", { name: "記事メニューを開く" })
    if (await menu.count()) {
      const bounds = await menu.boundingBox()
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize().width)
    }
  }
})
