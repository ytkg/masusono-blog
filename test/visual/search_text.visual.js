import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

// Keep Inertia requests inside Playwright's props replacement routes.
test.use({ serviceWorkers: "block" })

test("search preserves literal query, metadata and body text across links and history", async ({ page }) => {
  const literal = {
    id: "visual-article-1",
    title: "<Ruby> と &copy; のメモ",
    author: "A <B>",
    tags: "<Ruby>,&copy;",
    content: "<p>本文には &lt;Body&gt; と &copy; を表示する。</p>",
  }
  const markup = {
    id: "visual-article-2",
    title: "HTML要素だけの記事",
    author: "other",
    tags: "Ruby,©",
    content: "<ruby>本文</ruby><p>&lt;Elsewhere&gt;</p>",
  }
  await mockPageProps(page, "/search", (props) => { props.articles = [literal, markup] })
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article = literal
    props.relatedArticles = []
    props.yearAgoArticles = []
  })
  await openPage(page, "/search?q=%3CRuby%3E")
  const input = page.getByRole("textbox", { name: "記事を検索" })
  const result = page.getByRole("link", { name: literal.title, exact: true })
  const other = page.getByRole("link", { name: markup.title, exact: true })
  await expect(input).toHaveValue("<Ruby>")
  await expect(result).toBeVisible()
  await expect(other).toHaveCount(0)
  await input.fill("<Body> ©")
  await expect(result).toBeVisible()
  await expect(other).toHaveCount(0)
  await input.fill("<Missing>")
  await expect(page.getByText("該当する記事はありません。")).toBeVisible()
  await page.getByRole("button", { name: "検索語をクリア" }).click()
  await page.getByRole("button", { name: "@A <B>", exact: true }).click()
  await expect(input).toHaveValue('@"A <B>"')
  await expect(result).toBeVisible()
  await expect(other).toHaveCount(0)
  await page.goBack()
  await page.getByRole("button", { name: "#<Ruby>", exact: true }).click()
  await expect(input).toHaveValue("#<Ruby>")
  await expect(result).toBeVisible()
  await expect(other).toHaveCount(0)
  await result.click()
  await expect(page.getByRole("heading", { name: literal.title, level: 1, exact: true })).toBeVisible()
  await page.getByRole("link", { name: "#&copy;", exact: true }).click()
  await expect(input).toHaveValue("#&copy;")
  await expect(result).toBeVisible()
  await expect(other).toHaveCount(0)
  await page.reload()
  await expect(input).toHaveValue("#&copy;")
  await expect(result).toBeVisible()
  await expect(other).toHaveCount(0)
  await expectNoPageOverflow(page)
})
