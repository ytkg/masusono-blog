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

it("omits inert template and fallback content from copied text", () => {
  expect(
    buildArticleCopyText({ content: "<p>本文</p><template>hidden</template><noscript>fallback</noscript><p>末尾</p>" }),
  ).toBe("本文\n\n末尾")
})

it.each(["hidden", 'hidden="false"', 'hidden="until-found"'])(
  "コピーから%sの部分木を除き、aria-hiddenの可視本文とコードの字下げを保持する",
  (attribute) => {
    expect(
      buildArticleCopyText({
        title: "題名",
        content: `<p>本文<span ${attribute}>非表示<strong>子孫</strong></span><span aria-hidden="true">視覚</span></p><pre><code>  puts 1<span ${attribute}>非表示コード</span></code></pre><div ${attribute}><p>非表示段落</p></div><p>末尾</p>`,
      }),
    ).toBe("題名\n\n本文視覚\n\n  puts 1\n\n末尾")
  },
)
