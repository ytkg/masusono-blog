import { afterEach, describe, expect, it, vi } from "vitest"
import { extractHtmlText, extractTextFromHtml } from "./articleHtmlText"

afterEach(() => vi.unstubAllEnvs())

describe("browser and SSR HTML text", () => {
  it.each([
    "<p>一行目<br>二行目</p><div><h2>見出し</h2><ul><li>項目</li></ul></div>",
    '<p title="a > b">Ru<strong>by</strong>&nbsp;&copy;&#x110000;&custom;</p>',
    "<p>閉じ忘れ<p>段落<table><tr><td>表</td></tr></table>",
    "<template><p>非表示</p></template><p>本文</p>",
    "<pre><code>puts &lt;value&gt;\nputs 2</code></pre>",
  ])("HTML fragments produce identical text for hydration: %s", (html) => {
    vi.stubEnv("SSR", false)
    const browserText = extractHtmlText(html)
    vi.stubEnv("SSR", true)
    expect(extractHtmlText(html)).toBe(browserText)
  })
})

describe("extractTextFromHtml", () => {
  it("HTMLタグとエンティティをプレーンテキストへ変換する", () => {
    expect(extractTextFromHtml("<p>本文&nbsp;&amp; <strong>続き</strong> &#x1f60a; &#128640;</p>")).toBe(
      "本文 & 続き 😊 🚀",
    )
  })

  it("未知のエンティティは保持し、連続する空白を正規化する", () => {
    expect(extractTextFromHtml("<div>  one\n two &custom; </div>")).toBe("one two &custom;")
  })

  it("空文字は空文字を返す", () => {
    expect(extractTextFromHtml("   ")).toBe("")
  })
  it("段落と br の境界を保持し、抜粋では空白に畳み込む", () => {
    const html = "<p>一行目<br>二行目</p><p>三行目</p>"
    expect(extractHtmlText(html)).toBe("一行目\n二行目\n三行目\n")
    expect(extractTextFromHtml(html)).toBe("一行目 二行目 三行目")
  })

  it("DOM の文字参照デコードを利用し、不正なコードポイントでも失敗しない", () => {
    expect(extractTextFromHtml("&copy; &#x110000; &lt;Ruby&gt;")).toBe("© � <Ruby>")
  })

  it("属性内の > とインライン要素を正しく扱う", () => {
    expect(extractTextFromHtml('<p title="a > b">Ru<strong>by</strong></p>')).toBe("Ruby")
  })
})
