import { expect, test } from "@playwright/test"
import { richArticleContent } from "./contentFixtures"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

async function scrollToBottom(page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  await expect
    .poll(() =>
      page.evaluate(() => Math.round(document.documentElement.scrollHeight - window.innerHeight - window.scrollY)),
    )
    .toBe(0)
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  await expectNoPageOverflow(page)
}

async function expectAboveNavigation(page, content) {
  await expect(content).toBeVisible()
  const contentBox = await content.boundingBox()
  const navBox = await page.getByRole("navigation", { name: "メインナビゲーション" }).boundingBox()
  expect(contentBox.y + contentBox.height).toBeLessThanOrEqual(navBox.y)
}

test("article bottom with navigation", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.content = richArticleContent
  })
  await openPage(page, "/articles/visual-article-1")
  await expect(page.locator("[data-code-block-shell]")).toHaveCount(2)
  await page.getByRole("img", { name: "散歩記事の固定画像" }).evaluate((image) => image.decode())
  await scrollToBottom(page)
  await expectAboveNavigation(page, page.locator("#visual-article-end"))
  await expect(page).toHaveScreenshot("article-bottom-navigation.png")
})

test("long article list bottom with navigation", async ({ page }) => {
  await mockPageProps(page, "/authors/visual-author-1", (props) => {
    const article = props.articles[0]
    props.articles = Array.from({ length: 8 }, (_, index) => ({
      ...article,
      id: `visual-list-${index + 1}`,
      title: `散歩の記録 ${index + 1}`,
      content: `<p>寄り道で見つけたものを記録しました。${index === 7 ? "一覧の最後の本文です。" : ""}</p>`,
    }))
  })
  await openPage(page, "/authors/visual-author-1")
  await expect(page.getByRole("heading", { name: "散歩の記録 8", exact: true })).toBeVisible()
  await scrollToBottom(page)
  await expectAboveNavigation(page, page.getByText("寄り道で見つけたものを記録しました。一覧の最後の本文です。"))
  await expect(page).toHaveScreenshot("article-list-bottom-navigation.png")
})

test("numbers bottom with navigation", async ({ page }) => {
  await openPage(page, "/numbers")
  const chart = page.getByTestId("numbers-trend")
  await expect(chart.getByTestId("trend-line-totalArticles")).toBeVisible()
  await scrollToBottom(page)
  await expectAboveNavigation(page, chart.getByText("総文字数は1/300で表示しています。"))
  await expect(page).toHaveScreenshot("numbers-bottom-navigation.png")
})
