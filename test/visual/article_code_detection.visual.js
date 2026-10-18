import { expect, test } from "@playwright/test"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("valid code HTML with quoted angle brackets, comments and unquoted classes is decorated", async ({ page }) => {
  await page.addInitScript(() => {
    window.Worker = class {
      addEventListener(type, listener) { if (type === "message") this.listener = listener }
      postMessage() { this.listener({ data: { stdout: "ok", stderr: "" } }) }
      terminate() {}
    }
  })
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.content = '<pre title="a > b"><code class="language-ruby">puts 1</code></pre><pre><!-- sample --><code class="language-ruby">puts 2</code></pre><pre><code class=language-ruby>puts 3</code></pre>'
  })
  await openPage(page, "/articles/visual-article-1")
  await expect(page.getByRole("region", { name: "Rubyのコード" })).toHaveCount(3)
  await page.getByRole("button", { name: "▶ 実行" }).first().click()
  await expect(page.getByRole("region", { name: "Ruby実行結果" })).toHaveText("ok")
})
