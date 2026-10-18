import { expect, it } from "vitest"
import { findHealthPhraseRanges } from "./useVisibleHealthPhrase"

function matches(html) {
  const root = document.createElement("main")
  root.innerHTML = html
  return findHealthPhraseRanges(root).map(({ range }) => range.toString())
}

it("引用符・インライン装飾を含む本文から文言の正確な範囲を取得する", () => {
  expect(matches("<p>前文「増田と<strong>その他</strong>と、私の体調」後文</p>")).toEqual(["増田とその他と、私の体調"])
})

it("複数の出現箇所を取得する", () => {
  expect(matches("<p>増田とその他と、私の体調。増田とその他と、私の体調。</p>")).toHaveLength(2)
})

it("段落をまたいで結合したり、ヘッダーやスクリプトを本文として扱わない", () => {
  expect(
    matches(
      "<p>増田とその他</p><p>と、私の体調</p><header>増田とその他と、私の体調</header><script>増田とその他と、私の体調</script>",
    ),
  ).toEqual([])
})

it("別の意味ブロックを跨いで対象文言を組み立てない", () => {
  expect(matches("<div><section>増田とその他</section><section>と、私の体調</section></div>")).toEqual([])
})
