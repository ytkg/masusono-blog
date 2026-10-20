import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("code decoration preserves mixed pre contents and fragment targets", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.content =
      '<a href="#sample-code">コードへ</a><pre>前文<code class="language-js">const n = 1</code>後文</pre>' +
      '<pre><code class="language-js">一つ目</code><code class="language-js">二つ目</code></pre>' +
      '<div style="height:900px"></div><pre id="sample-code"><code class="language-ruby">puts :anchor</code></pre>' +
      '<pre><code class="language-js">const decorated = 2</code></pre>'
  })
  await openPage(page, "/articles/visual-article-1")
  await expect(page.locator("[data-code-block-shell]")).toHaveCount(1)
  const body = page.getByTestId("article-body-html")
  await expect(body.locator("pre").filter({ hasText: "前文" })).toHaveText("前文const n = 1後文")
  await expect(body.locator("pre").filter({ hasText: "一つ目" })).toHaveText("一つ目二つ目")
  await expect(page.getByRole("button", { name: "▶ 実行" })).toHaveCount(0)
  await page.getByRole("link", { name: "コードへ", exact: true }).click()
  await expect(page).toHaveURL(/#sample-code$/)
  await expect(page.locator("#sample-code")).toBeInViewport()
  await expect(page.locator("#sample-code")).toHaveText("puts :anchor")
  await expectNoPageOverflow(page)
})
