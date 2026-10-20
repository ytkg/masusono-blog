import { expect, test } from "@playwright/test"
import { expectNoPageOverflow, mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("code br line breaks survive decoration and Ruby execution", async ({ page }) => {
  await page.addInitScript(() => {
    window.Worker = class {
      addEventListener(type, listener) {
        if (type === "message") this.listener = listener
      }
      postMessage({ code }) {
        this.listener({ data: { stdout: code, stderr: "" } })
      }
      terminate() {}
    }
  })
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.content =
      '<pre><code class="language-ruby"># comment<br><span>  puts &quot;ok&quot;</span><br><br>puts 2</code></pre>' +
      '<pre><code class="language-js">// comment<br>const n = 1</code></pre>'
  })
  await openPage(page, "/articles/visual-article-1")
  const ruby = page.getByRole("region", { name: "Rubyのコード", exact: true })
  await expect(ruby.locator("pre > code > [data-code-line]")).toHaveCount(4)
  await expect(ruby.locator("pre > code > [data-code-line]").nth(1)).toContainText('  puts "ok"')
  const javascript = page.getByRole("region", { name: "JavaScriptのコード", exact: true })
  await expect(javascript.locator("pre > code > [data-code-line]")).toHaveCount(2)
  await expect(javascript.locator("pre > code > [data-code-line]").nth(1)).toContainText("const n = 1")
  await page.getByRole("button", { name: "▶ 実行" }).click()
  await expect(page.getByRole("region", { name: "Ruby実行結果", exact: true })).toHaveJSProperty("textContent", '# comment\n  puts "ok"\n\nputs 2')
  await expectNoPageOverflow(page)
})
