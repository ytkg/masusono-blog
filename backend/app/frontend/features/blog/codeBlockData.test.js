import { describe, expect, it } from "vitest"
import { buildCodeBlockDataFromHtml } from "./codeBlockData"

describe("buildCodeBlockDataFromHtml", () => {
  it("language- 接頭辞から Prism 用の言語設定を返す", () => {
    expect(buildCodeBlockDataFromHtml('<pre><code class="language-js">const value = 1</code></pre>')).toEqual({
      code: "const value = 1",
      languageKey: "js",
      languageLabel: "JavaScript",
      prismLanguage: "javascript",
    })
  })

  it("lang- 接頭辞と既知のクラス名を解決する", () => {
    expect(buildCodeBlockDataFromHtml('<pre><code class="lang-ruby">puts :hello</code></pre>')).toMatchObject({
      languageKey: "ruby",
      languageLabel: "Ruby",
      prismLanguage: "ruby",
    })
    expect(
      buildCodeBlockDataFromHtml('<pre><code class="typescript">const value: string = "ok"</code></pre>'),
    ).toMatchObject({
      languageKey: "typescript",
      languageLabel: "TypeScript",
      prismLanguage: "typescript",
    })
  })

  it("未知の言語は元の言語名を保つ", () => {
    expect(buildCodeBlockDataFromHtml('<pre><code class="language-kotlin">fun main() {}</code></pre>')).toEqual({
      code: "fun main() {}",
      languageKey: "kotlin",
      languageLabel: "kotlin",
      prismLanguage: "kotlin",
    })
  })

  it("言語指定またはコードブロックがない場合はundefinedを返す", () => {
    expect(buildCodeBlockDataFromHtml("<pre><code>puts :hello</code></pre>")).toBeUndefined()
    expect(buildCodeBlockDataFromHtml("<p>本文</p>")).toBeUndefined()
  })
})
