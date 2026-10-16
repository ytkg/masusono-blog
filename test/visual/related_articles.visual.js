import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("related article titles and navigation", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.yearAgoArticles = [{ id: "past", title: "前年の記事" }]
    props.relatedArticles = [
      {
        tag: "散歩",
        articles: [
          { id: "visual-article-2", title: "友人と食べた昼ごはん" },
          {
            id: "long-title",
            title: "長い関連記事のタイトルも省略せず最後まで読めることを確認するための散歩と日常についての記事",
          },
          { id: "third", title: "三つ目の関連記事" },
        ],
      },
      { tag: "日常", articles: [{ id: "visual-article-2", title: "友人と食べた昼ごはん" }] },
    ]
  })
  await openPage(page, "/articles/visual-article-1")
  const section = page.getByRole("region", { name: "散歩の記事" })
  await section.scrollIntoViewIfNeeded()
  await expect(section.getByRole("link")).toHaveCount(3)
  const nextSection = page.getByRole("region", { name: "日常の記事" })
  const yearAgoSection = page.getByRole("region", { name: "1年前の記事" })
  const firstList = await section.getByRole("list").boundingBox()
  const nextHeading = await nextSection.getByRole("heading").boundingBox()
  const nextList = await nextSection.getByRole("list").boundingBox()
  const yearAgoHeading = await yearAgoSection.getByRole("heading").boundingBox()
  expect(nextHeading.y - (firstList.y + firstList.height)).toBeCloseTo(
    yearAgoHeading.y - (nextList.y + nextList.height),
    0,
  )
  await expectNoPageOverflow(page)
  await expect(section).toHaveScreenshot("related-articles.png")
  await expect(page.getByRole("region", { name: "日常の記事" })).toHaveScreenshot("related-articles-second-tag.png")
  await section.getByRole("link", { name: "友人と食べた昼ごはん" }).click()
  await expect(page).toHaveURL(/\/articles\/visual-article-2$/)
  await expect(page.getByRole("heading", { level: 1, name: "友人と食べた昼ごはん" })).toBeVisible()
})

test("related articles in initial HTML and after Inertia navigation", async ({ page, request }) => {
  const response = await request.get("/articles/visual-article-1")
  expect(await response.text()).toMatch(/<a[^>]+href="\/articles\/visual-article-2"[^>]*>友人と食べた昼ごはん<\/a>/)
  await openPage(page, "/")
  await page.getByRole("link", { name: "週末の散歩で見つけたもの", exact: true }).click()
  const section = page.getByRole("region", { name: "日常の記事" })
  await expect(section.getByRole("link", { name: "友人と食べた昼ごはん" })).toHaveAttribute(
    "href",
    "/articles/visual-article-2",
  )
})
