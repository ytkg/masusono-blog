import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("hidden inline text does not prevent matching the visible health phrase", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.title = "hidden inline"
    props.article.content = '<p>増田と<span hidden>非表示</span>その他と、私の体調</p>'
  })
  await openPage(page, "/articles/visual-article-1")
  const logo = page.locator('header img[aria-hidden="false"]')
  await expect(logo).toHaveAttribute("alt", "増田とその他！と、私の体調")
  await page.getByTestId("article-body-html").locator("span[hidden]").evaluate((element) => element.removeAttribute("hidden"))
  await expect(logo).toHaveAttribute("alt", "増田とその他！")
})
