import { test, expect } from "@playwright/test"
import { openPage, expectNoPageOverflow } from "./helpers"

// Keep fixture responses in the browser; the service worker otherwise bypasses page routes.
test.use({ serviceWorkers: "block" })

const books = Array.from({ length: 24 }, (_, i) => ({
  isbn: String(9784101010014 + i),
  title:
    i === 0 ? "長い書名 ABC 123 / 記号とローマ字がある本についてのとても長いタイトル" : `記事に登場した本 ${i + 1}`,
  author: "著者, 1900-2000 / Author Name・共同著者",
  amazonUrl: "https://www.amazon.co.jp/dp/4101010013",
  articles: [{ id: "visual-article-1", title: "週末の散歩で見つけたもの" }],
}))

async function launch(page, data) {
  await page.route("**/api/app/bookshelf", (route) => route.fulfill({ json: data }))
  await page.route("**/api/app/bookshelf/*/cover", (route) => route.fulfill({ json: { cover: null } }))
  await openPage(page, "/others")
  await page.getByRole("button", { name: "本棚を開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
}

test("bookshelf spines and detail keyboard navigation", async ({ page }) => {
  await launch(page, { books, partial: false })
  const first = page.getByRole("button", { name: `${books[0].title} / 著者 Author Name・共同著者`, exact: true })
  await expect(first).toBeVisible()
  const screen = await page.getByRole("region", { name: "本棚の画面" }).boundingBox()
  expect(screen.x).toBe(0)
  expect(screen.width).toBe(page.viewportSize().width)
  expect(screen.y + screen.height).toBe(page.viewportSize().height)
  const dimensions = await first.boundingBox()
  expect(dimensions.width).toBe(44)
  if (page.viewportSize().width === 390) {
    const sixth = await page.getByRole("button", { name: `${books[5].title} / 著者 Author Name・共同著者`, exact: true }).boundingBox()
    expect(sixth.y).toBe(dimensions.y)
  }
  await expectNoPageOverflow(page)
  await expect(page).toHaveScreenshot("bookshelf.png")
  const last = page.getByRole("button", { name: `${books[23].title} / 著者 Author Name・共同著者`, exact: true })
  await last.scrollIntoViewIfNeeded()
  await last.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: books[23].title, exact: true })).toBeVisible()
  await expect(page).toHaveScreenshot("bookshelf-detail.png")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await expect(last).toBeFocused()
  await expect(last).toBeInViewport()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "本棚を開く" })).toBeFocused()
})

for (const state of ["empty", "error", "partial"]) {
  test(`bookshelf ${state}`, async ({ page }) => {
    await launch(page, { books: state === "partial" ? books.slice(0, 2) : [], partial: state === "partial" })
    if (state === "error") {
      await page.keyboard.press("Escape")
      await page.route("**/api/app/bookshelf", (route) =>
        route.fulfill({ status: 502, json: { error: { code: "upstream_error" } } }),
      )
      await page.getByRole("button", { name: "本棚を開く" }).click()
      await expect(page.getByText("読み込めませんでした")).toBeVisible()
      await expect(page.getByRole("button", { name: "再試行" })).toBeVisible()
    } else {
      await expect(
        page.getByText(
          state === "empty"
            ? "表示できる本はまだありません"
            : "一部の本を読み込めませんでした。取得できた本を表示しています。",
        ),
      ).toBeVisible()
    }
    await expect(page).toHaveScreenshot(`bookshelf-${state}.png`)
  })
}

for (const imageState of ["loaded", "failed"]) {
  test(`bookshelf long detail cover ${imageState}`, async ({ page }) => {
    await launch(page, { books: books.slice(0, 1), partial: false })
    await page.route("**/api/app/bookshelf/*/cover", (route) =>
      route.fulfill({
        json: {
          cover: {
            imageUrl: "https://books.google.com/mock-cover.png",
            googleBooksUrl: "https://books.google.com/books?id=visual",
            removalContactUrl: "https://example.com/contact",
          },
        },
      }),
    )
    await page.route("https://books.google.com/mock-cover.png", (route) =>
      imageState === "loaded"
        ? route.fulfill({ path: "public/icons/icon-512.png", contentType: "image/png" })
        : route.fulfill({ status: 404, body: "" }),
    )
    await page.route("https://books.google.com/googlebooks/images/poweredby.png", (route) =>
      route.fulfill({ path: "public/favicon-32.png", contentType: "image/png" }),
    )
    await page.getByRole("button", { name: `${books[0].title} / 著者 Author Name・共同著者`, exact: true }).click()
    await expect(page.getByRole("heading", { name: books[0].title, exact: true })).toBeVisible()
    if (imageState === "loaded") {
      const image = page.getByRole("img", { name: `${books[0].title}の表紙` })
      await expect(image).toBeVisible()
      await image.evaluate((element) => element.decode())
      await expect(page.getByRole("link", { name: "Google Books", exact: true })).toBeVisible()
    } else {
      await expect(page.getByRole("img", { name: `${books[0].title}の表紙` })).toHaveCount(0)
    }
    await expect(page.getByRole("link", { name: "週末の散歩で見つけたもの" })).toBeVisible()
    await expect(page).toHaveScreenshot(`bookshelf-cover-${imageState}.png`)
  })
}

for (const count of [1, 19]) {
  test(`bookshelf glyphs and bottom contact with ${count} books`, async ({ page }) => {
    const titles = ["普通の底", "硝子の塔の殺人", "まだ、同じ夢を見ていた", "心心・東京の星 上海の月"]
    const catalog = books.slice(0, count).map((book, i) => ({ ...book, title: titles[i % titles.length] }))
    await launch(page, { books: catalog, partial: false })
    const shelf = page.getByLabel("記事に登場する本", { exact: true })
    await expect(shelf.getByRole("button")).toHaveCount(count)
    await page.evaluate(() => document.fonts.ready)
    const glyphsFit = await shelf.locator("button > span").evaluateAll((elements) =>
      elements.every((element) => {
        const box = element.getBoundingClientRect()
        return Array.from(element.firstChild.textContent).every((_, i) => {
          const range = document.createRange()
          range.setStart(element.firstChild, i)
          range.setEnd(element.firstChild, i + 1)
          const glyph = range.getBoundingClientRect()
          return glyph.left >= box.left && glyph.right <= box.right
        })
      }),
    )
    expect(glyphsFit).toBe(true)
    const last = shelf.getByRole("button").last()
    await last.scrollIntoViewIfNeeded()
    const bottomGap = await shelf.evaluate((element) => {
      const bottom = element.getBoundingClientRect().bottom
      const bookBottom = element.lastElementChild.getBoundingClientRect().bottom
      return bottom - parseFloat(getComputedStyle(element).borderBottomWidth) - bookBottom
    })
    expect(bottomGap).toBe(0)
    await expect(page).toHaveScreenshot(`bookshelf-bottom-${count}.png`)
  })
}
