import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("author without articles", async ({ page }) => {
  await mockPageProps(page, "/authors/visual-author-1", (props) => {
    props.articles = []
  })
  await openPage(page, "/authors/visual-author-1")
  await expect(page.getByRole("heading", { name: "増田愛美", level: 1 })).toBeVisible()
  await expect(page.getByText("0件", { exact: true })).toBeVisible()
  await expect(page.getByText("この著者の記事はまだありません。")).toBeVisible()
  await expect(page.getByTestId("article-body-html")).toHaveCount(0)
  await expect(page).toHaveScreenshot("author-without-articles.png")
})

test("numbers without data", async ({ page }) => {
  await mockPageProps(page, "/numbers", (props) => {
    props.metrics = { rows: [], trend: null }
  })
  await openPage(page, "/numbers")
  await expect(page.getByRole("heading", { name: "数字でわかる、増田とその他！", level: 1 })).toBeVisible()
  await expect(page.getByText("データがありません。")).toBeVisible()
  await expect(page.getByTestId("numbers-trend")).toHaveCount(0)
  await expect(page).toHaveScreenshot("numbers-without-data.png")
})
