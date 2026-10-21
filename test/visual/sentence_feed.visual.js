import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test("home beginnings waits for all periods and retries without displaying recent candidates", async ({
  page,
  context,
}) => {
  const articles = Array.from({ length: 120 }, (_, index) => ({
    id: `article-${index}`,
    content: `<p>記事${index}の書き出し。</p>`,
  }))
  await mockPageProps(page, "/", (props) => {
    props.articles = articles.slice(0, 10)
    props.pagination = { nextOffset: 10 }
  })
  let attempts = 0
  await context.route("**/api/app/sentence_articles", (route) => {
    attempts += 1
    return route.fulfill(attempts === 1 ? { status: 500, json: {} } : { json: { articles } })
  })
  await openPage(page, "/")
  await page.getByRole("tab", { name: "書き出し" }).click()
  const cards = page.locator(".sentence-card")
  await expect(page.getByText("記事を読み込めませんでした。")).toBeVisible()
  await expect(cards).toHaveCount(0)
  await page.getByRole("button", { name: "再試行" }).click()
  await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(80)
  const ids = await cards.evaluateAll((elements) =>
    elements.slice(0, 80).map((element) => element.getAttribute("href")),
  )
  expect(new Set(ids).size).toBe(80)
  expect(ids.some((id) => Number(id.split("-").at(-1)) >= 10)).toBe(true)
  await page.getByRole("tab", { name: "フィード" }).click()
  await page.getByRole("tab", { name: "書き出し" }).click()
  await expect.poll(() => cards.count()).toBeGreaterThanOrEqual(80)
  expect(
    await cards.evaluateAll((elements) => elements.slice(0, 80).map((element) => element.getAttribute("href"))),
  ).toEqual(ids)
  expect(attempts).toBe(2)
})
