import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("explicit breaks and empty blocks do not assemble the health phrase", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.title = "文言の境界"
    props.article.content = "<div>増田とその他と、私の体調</div>"
  })
  await openPage(page, "/articles/visual-article-1")
  const logo = page.locator('header img[aria-hidden="false"]')
  const body = page.getByTestId("article-body-html")
  await expect(logo).toHaveAttribute("alt", "増田とその他！と、私の体調")
  for (const boundary of ["<br>", "<hr>", "<section></section>"]) {
    await body.evaluate((element, boundary) => {
      element.innerHTML = `<div>増田とその他${boundary}と、私の体調</div>`
    }, boundary)
    await expect(logo).toHaveAttribute("alt", "増田とその他！")
    await body.evaluate((element) => {
      element.innerHTML = "<div>増田と<strong>その他</strong>と、私の体調</div>"
    })
    await expect(logo).toHaveAttribute("alt", "増田とその他！と、私の体調")
  }
})
