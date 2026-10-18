import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

const limitedAlt = "増田とその他！と、私の体調"
const normalAlt = "増田とその他！"
const phrase = "増田とその他と、私の体調"

async function disablePreference(page) {
  await page.context().addCookies([{ name: "seasonal_logo_20261018_autumn_health", value: "off", url: "http://localhost:3000" }])
}

test("visible phrase overrides preference only while the actual text is visible", async ({ page }) => {
  await disablePreference(page)
  await mockPageProps(page, "/articles/visual-article-2", (props) => {
    props.article.content = '<p>前文</p><div style="height:1100px"></div><p id="logo-trigger">「増田と<strong>その他</strong>と、私の体調」</p><div style="height:1100px"></div><p>末尾</p>'
    props.relatedArticles = []
    props.yearAgoArticles = []
  })
  await openPage(page, "/articles/visual-article-2")
  const logo = page.locator("header img")
  const trigger = page.locator("#logo-trigger")
  await expect(logo).toHaveAttribute("alt", normalAlt)
  await trigger.evaluate((element) => element.scrollIntoView({ block: "center" }))
  await expect(logo).toHaveAttribute("alt", limitedAlt)
  await expect(page).toHaveScreenshot("health-phrase-visible.png")
  // A line behind the sticky header is in the viewport but is not visible.
  await trigger.evaluate((element) => {
    window.scrollBy(0, element.getBoundingClientRect().bottom - document.querySelector("header").getBoundingClientRect().bottom + 1)
  })
  await expect(logo).toHaveAttribute("alt", normalAlt)
  await trigger.evaluate((element) => element.scrollIntoView({ block: "center" }))
  await expect(logo).toHaveAttribute("alt", limitedAlt)
  await trigger.evaluate((element) => { element.style.visibility = "hidden" })
  await expect(logo).toHaveAttribute("alt", normalAlt)
  await trigger.evaluate((element) => { element.style.visibility = "visible" })
  await expect(logo).toHaveAttribute("alt", limitedAlt)
  await page.evaluate(() => {
    const overlay = document.createElement("div")
    overlay.id = "test-overlay"
    overlay.style.cssText = "position:fixed;inset:0;background:white;z-index:99999"
    document.body.append(overlay)
  })
  await expect(logo).toHaveAttribute("alt", normalAlt)
  await page.locator("#test-overlay").evaluate((element) => element.remove())
  await expect(logo).toHaveAttribute("alt", limitedAlt)
  await trigger.evaluate((element) => element.remove())
  await expect(logo).toHaveAttribute("alt", normalAlt)
  expect((await page.context().cookies()).find(({ name }) => name === "seasonal_logo_20261018_autumn_health").value).toBe("off")
})

test("multiple visible phrases and navigation restore the appropriate logo", async ({ page }) => {
  await disablePreference(page)
  await mockPageProps(page, "/", (props) => {
    props.articles[0].content = `<p id="first-phrase">${phrase}</p><p id="second-phrase">${phrase}</p>`
  })
  await openPage(page, "/")
  const logo = page.locator("header img")
  await expect(logo).toHaveAttribute("alt", limitedAlt)
  await page.locator("#first-phrase").evaluate((element) => element.remove())
  await expect(logo).toHaveAttribute("alt", limitedAlt)
  await page.locator("#second-phrase").evaluate((element) => element.remove())
  await expect(logo).toHaveAttribute("alt", normalAlt)
  await page.getByRole("link", { name: "検索", exact: true }).click()
  await expect(page.getByRole("textbox", { name: "記事を検索" })).toBeVisible()
  await expect(logo).toHaveAttribute("alt", normalAlt)
  await openPage(page, "/articles/1cxjrah487")
  await expect(logo).toHaveAttribute("alt", limitedAlt)
})

test("footer gaps do not trigger the logo while scrolling", async ({ page }) => {
  await disablePreference(page)
  await mockPageProps(page, "/articles/visual-article-2", (props) => {
    props.article.content = `<div style="height:1100px"></div><p id="logo-trigger">${phrase}</p><div style="height:1100px"></div>`
    props.relatedArticles = []
    props.yearAgoArticles = []
  })
  await openPage(page, "/articles/visual-article-2")
  const logo = page.locator("header img")
  const trigger = page.locator("#logo-trigger")
  // Move the text through the lower gap, rounded corner and side gap of the real navigation.
  for (const position of ["below", "corner", "side", "above", "side", "below"]) {
    await trigger.evaluate((element, position) => {
      const navigation = document.querySelector('nav[aria-label="メインナビゲーション"]').getBoundingClientRect()
      element.style.margin = "0"
      element.style.width = "1em"
      element.style.whiteSpace = "nowrap"
      element.style.transform = ""
      element.style.transform = `translateX(${1 - element.getBoundingClientRect().left}px)`
      const line = element.getBoundingClientRect()
      const target = position === "below" ? navigation.bottom + 1 : position === "corner" ? navigation.top + 2 : position === "side" ? navigation.top + navigation.height / 2 : navigation.top - line.height - 2
      window.scrollBy(0, line.top - target)
    }, position)
    await expect(logo).toHaveAttribute("alt", position === "above" ? limitedAlt : normalAlt)
  }
})
