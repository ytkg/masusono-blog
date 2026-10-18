import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("code decoration preserves hidden HTML boundaries and visible Ruby controls", async ({ page }) => {
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.content = [
      '<pre id="hidden-pre" hidden><code class="language-ruby">puts :hidden_pre</code></pre>',
      '<pre id="hidden-code"><code class="language-ruby" hidden="false">puts :hidden_code</code></pre>',
      '<pre id="hidden-child"><code class="language-ruby">puts :visible<span hidden>puts :hidden_child</span></code></pre>',
      '<section id="hidden-ancestor" hidden><pre><code class="language-ruby">puts :hidden_ancestor</code></pre></section>',
      '<pre id="until-found" hidden="until-found"><code class="language-ruby">puts :until_found</code></pre>',
      '<pre><code class="language-ruby">puts :normal</code></pre>',
    ].join("")
  })
  await openPage(page, "/articles/visual-article-1")
  const body = page.getByTestId("article-body-html")
  await expect(body.locator("[data-code-block-shell]")).toHaveCount(1)
  await expect(body.getByRole("button", { name: "▶ 実行" })).toHaveCount(1)
  await expect(body.getByRole("region", { name: "Rubyのコード" })).toContainText("puts :normal")
  await expect(body.locator("#hidden-pre")).toBeHidden()
  await expect(body.locator("#hidden-code code")).toBeHidden()
  await expect(body.locator("#hidden-child span")).toBeHidden()
  await expect(body.locator("#hidden-child")).toBeVisible()
  await expect(body.locator("#hidden-ancestor")).toBeHidden()
  await expect(body.locator("#until-found")).toHaveAttribute("hidden", "until-found")
  await expect(body.locator("#until-found")).toHaveCSS("content-visibility", "hidden")
  await body.locator("#until-found").evaluate((element) => element.removeAttribute("hidden"))
  await expect(body.locator("#until-found code")).toBeVisible()
  await expect(body.locator("#until-found code")).toHaveText("puts :until_found")
})
