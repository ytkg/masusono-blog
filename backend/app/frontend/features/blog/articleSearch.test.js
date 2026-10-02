import { describe, expect, it } from "vitest"
import { articleMatchesQuery, normalizeArticleSearchText } from "./articleSearch"

describe("articleSearch", () => {
  const article = {
    title: "母に同感",
    author: "その他4",
    tags: "家族,内省,生き方",
    readingTimeMinutes: 1.5,
    content: "<p>明るく前向きでいなきゃいけない雰囲気に距離を置く話。</p>",
  }

  function matches(query) {
    return articleMatchesQuery(article, normalizeArticleSearchText(query))
  }

  it("空検索なら一致する", () => {
    expect(matches("")).toBe(true)
  })

  it("空白区切りを AND 検索として扱う", () => {
    expect(matches("母 前向き")).toBe(true)
    expect(matches("母 仕事")).toBe(false)
  })

  it("明示 AND を空白区切りと同じ扱いにする", () => {
    expect(matches("母 AND 前向き")).toBe(true)
    expect(matches("母 and 仕事")).toBe(false)
  })

  it("OR 区切りを OR 検索として扱う", () => {
    expect(matches("仕事 OR 家族")).toBe(true)
    expect(matches("仕事 or 技術")).toBe(false)
  })

  it("OR で区切った各グループ内を AND 検索として扱う", () => {
    expect(matches("仕事 技術 OR 家族 内省")).toBe(true)
    expect(matches("家族 仕事 OR 技術 生き方")).toBe(false)
  })

  it("#付きトークンはタグだけを検索対象にする", () => {
    expect(matches("#家族")).toBe(true)
    expect(matches("#前向き")).toBe(false)
  })

  it("#付きトークンはタグの完全一致だけを対象にする", () => {
    const articleWithRubyKaigi = {
      ...article,
      tags: " RubyKaigi, , 技術 ",
    }

    expect(articleMatchesQuery(articleWithRubyKaigi, normalizeArticleSearchText("#AI"))).toBe(false)
    expect(articleMatchesQuery(articleWithRubyKaigi, normalizeArticleSearchText("#RubyKaigi"))).toBe(true)
  })

  it("#付きトークンと通常トークンを混在できる", () => {
    expect(matches("#家族 前向き")).toBe(true)
    expect(matches("#仕事 前向き")).toBe(false)
  })

  it("@付きトークンは著者だけを検索対象にする", () => {
    expect(matches("@その他4")).toBe(true)
    expect(matches("@母")).toBe(false)
  })

  it("@付きトークンを AND/OR 検索で使える", () => {
    expect(matches("@その他4 #家族")).toBe(true)
    expect(matches("@増田 #家族 OR @その他4 #内省")).toBe(true)
    expect(matches("@増田 #家族 OR @その他4 #仕事")).toBe(false)
  })

  it("read:N は読了目安だけを検索対象にする", () => {
    expect(matches("read:2")).toBe(true)
    expect(matches("read:1")).toBe(false)
    expect(matches("read:1.5")).toBe(true)
  })

  it("read:N-M はN分より長くM分以内の読了目安だけを検索対象にする", () => {
    expect(matches("read:1-2")).toBe(true)
    expect(matches("read:0.5-1")).toBe(false)
  })

  it("read:N+ はN分以上の読了目安だけを検索対象にする", () => {
    expect(matches("read:1+")).toBe(true)
    expect(matches("read:2+")).toBe(false)
  })

  it("単語内の or は OR 演算子として扱わない", () => {
    expect(matches("story")).toBe(false)
    expect(matches("その他4")).toBe(true)
  })
  it("表示された文字参照とインライン要素の文字列で検索できる", () => {
    const encoded = { ...article, content: "<p>Ru<strong>by</strong> &copy; &amp; Rails</p>" }
    expect(articleMatchesQuery(encoded, normalizeArticleSearchText("Ruby ©"))).toBe(true)
    expect(articleMatchesQuery(encoded, normalizeArticleSearchText("Rails &"))).toBe(true)
  })
})
