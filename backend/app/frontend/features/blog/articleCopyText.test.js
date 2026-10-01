import { describe, expect, it } from "vitest"
import { buildArticleCopyText } from "./articleCopyText"

describe("buildArticleCopyText", () => {
  it("段落、改行、インライン要素、エンティティをテキストに変換する", () => {
    expect(
      buildArticleCopyText({
        title: "題名",
        content:
          "<h2>見出し</h2><p>前<strong>太字</strong>後 &amp; &#x1f60a;<br>次の行</p><ul><li>一</li><li>二</li></ul>",
      }),
    ).toBe("題名\n\n見出し\n\n前太字後 & 😊\n次の行\n\n一\n\n二")
  })
  it("コードのインデントを保持し、埋め込みのスクリプトやスタイルを除外する", () => {
    expect(
      buildArticleCopyText({
        content:
          '<pre><code>def hello\n  puts "hello"\nend</code></pre><script>secret()</script><style>p { color: red }</style>',
      }),
    ).toBe('def hello\n  puts "hello"\nend')
  })
  it("本文がない記事もコピーできる", () => {
    expect(buildArticleCopyText({ title: "題名" })).toBe("題名")
    expect(buildArticleCopyText({})).toBe("")
  })
})
