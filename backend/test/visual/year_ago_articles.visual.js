import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

test("year ago articles below related articles and navigation", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.yearAgoArticles = [
      { id: "visual-article-2", title: "友人と食べた昼ごはん" },
      {
        id: "past-long",
        title: "1年前の同じ日に書いた長いタイトルの記事も省略せず最後まで読めることを確認するための散歩と日常の記録",
      },
      { id: "past-third", title: "三つ目の記事" },
      { id: "past-fourth", title: "四つ目の記事も表示する" },
    ]
  })
  await openPage(page, "/articles/visual-article-1")
  const section = page.getByRole("region", { name: "1年前の記事" })
  await section.scrollIntoViewIfNeeded()
  await expect(section.getByRole("link")).toHaveCount(4)
  await expectNoPageOverflow(page)
  await expect(page.locator("main")).toHaveScreenshot("year-ago-articles.png")
  await section.getByRole("link", { name: "友人と食べた昼ごはん" }).click()
  await expect(page).toHaveURL(/\/articles\/visual-article-2$/)
  await expect(page.getByRole("region", { name: "1年前の記事" })).toHaveCount(0)
})
