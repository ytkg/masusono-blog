import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

for (const authorId of ["visual-author-1", "visual-author-2", undefined]) {
  test(`article author after body ${authorId ?? "missing"}`, async ({ page }) => {
    await mockPageProps(page, "/articles/visual-article-1", (props) => {
      props.article.authorId = authorId
      props.article.author = authorId === "visual-author-2" ? "その他2" : "その他1"
      props.article.content = "<p>読後リンクの前の本文です。</p>"
      props.relatedArticles = []
      props.yearAgoArticles = []
    })
    await openPage(page, "/articles/visual-article-1")
    const link = page.getByRole("link", { name: /の他の記事を読む →/ })
    await expect(link).toHaveCount(authorId ? 1 : 0)
    if (authorId) {
      await expect(link).toHaveAttribute("href", `/authors/${authorId}`)
      const headerLink = page.getByRole("link", { name: authorId === "visual-author-2" ? "その他2" : "その他1", exact: true })
      await expect(headerLink).toHaveAttribute("href", `/authors/${authorId}`)
      await link.focus()
      await page.keyboard.press("Shift+Tab")
      await page.keyboard.press("Tab")
      await expect(link).toBeFocused()
      await expect(page).toHaveScreenshot(`article-author-${authorId}.png`)
      await link.click()
      await expect(page).toHaveURL(new RegExp(`/authors/${authorId}$`))
      await expect(page.locator("main")).toBeVisible()
    }
    await expectNoPageOverflow(page)
  })
}
