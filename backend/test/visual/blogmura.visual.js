import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

for (const hasRelated of [true, false]) {
  test(`article support banner with related articles ${hasRelated}`, async ({ page }) => {
    await mockPageProps(page, "/articles/visual-article-1", (props) => {
      props.article.content = "<p>応援リンクの前の本文です。</p>"
      props.relatedArticles = hasRelated ? [{ id: "related", title: "関連記事のタイトル" }] : []
    })
    await openPage(page, "/articles/visual-article-1")
    const imageLink = page.getByRole("link", { name: "にほんブログ村 その他日記ブログへ" })
    const textLink = page.getByRole("link", { name: "にほんブログ村", exact: true })
    await expect(imageLink).toHaveCount(1)
    await expect(textLink).toHaveCount(1)
    const image = imageLink.locator("img")
    await image.evaluate((element) => element.decode())
    await expect(image).toHaveCSS("width", "88px")
    await expect(image).toHaveCSS("height", "31px")
    await expect(page.getByRole("region", { name: "関連記事" })).toHaveCount(hasRelated ? 1 : 0)
    for (const link of [imageLink, textLink]) {
      await expect(link).toHaveAttribute("href", "https://diary.blogmura.com/ranking/in?p_cid=11218704")
      await expect(link).toHaveAttribute("target", "_blank")
      await expect(link).toHaveAttribute("rel", "noopener")
    }
    await imageLink.focus()
    await page.keyboard.press("Tab")
    await expect(textLink).toBeFocused()
    await expectNoPageOverflow(page)
    await expect(page).toHaveScreenshot(`article-support-related-${hasRelated}.png`)
  })
}
