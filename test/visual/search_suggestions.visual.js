import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("equivalent author and tag suggestions keep the first label and search all matches", async ({ page }) => {
  await mockPageProps(page, "/search", (props) => {
    props.articles = [
      { id: "one", title: "一つ目", author: "A  or B", tags: "Ruby  on Rails, JavaScript", content: "本文" },
      { id: "two", title: "二つ目", author: "a or b", tags: "ruby on rails, javascript", content: "本文" },
      { id: "three", title: "三つ目", author: "A or B", tags: "Ruby on Rails, Rust", content: "本文" },
    ]
  })
  await openPage(page, "/search")
  const candidates = page.getByRole("button", { name: /^[#@]/ })
  await expect(candidates).toHaveCount(4)
  expect(await candidates.allTextContents()).toEqual(["@A  or B", "#Ruby  on Rails", "#JavaScript", "#Rust"])
  await candidates.nth(1).click()
  await expect(page.getByRole("textbox", { name: "記事を検索" })).toHaveValue('#"Ruby on Rails"')
  for (const title of ["一つ目", "二つ目", "三つ目"]) {
    await expect(page.getByRole("link", { name: title, exact: true })).toBeVisible()
  }
  await expectNoPageOverflow(page)
})
