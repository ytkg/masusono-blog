import { buildArticleSearchTerm } from "./articleSearchTerm"
import { describe, expect, it } from "vitest"
import { prepareArticleQuery, normalizeArticleSearchText } from "./articleSearch"

describe("articleSearch", () => {
  const article = {
    title: "母に同感",
    author: "その他4",
    tags: "家族,内省,生き方",
    readingTimeMinutes: 1.5,
    content: "<p>明るく前向きでいなきゃいけない雰囲気に距離を置く話。</p>",
  }

  function matches(query) {
    return prepareArticleQuery(normalizeArticleSearchText(query))(article)
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

    expect(prepareArticleQuery(normalizeArticleSearchText("#AI"))(articleWithRubyKaigi)).toBe(false)
    expect(prepareArticleQuery(normalizeArticleSearchText("#RubyKaigi"))(articleWithRubyKaigi)).toBe(true)
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
    expect(prepareArticleQuery(normalizeArticleSearchText("Ruby ©"))(encoded)).toBe(true)
    expect(prepareArticleQuery(normalizeArticleSearchText("Rails &"))(encoded)).toBe(true)
  })
})

it.each(["Ruby on Rails", "research and development", 'say "hi"', "a\\b"])(
  "選択したタグを1つの検索条件として扱う: %s",
  (tag) => {
    const query = normalizeArticleSearchText(buildArticleSearchTerm("#", tag))
    expect(prepareArticleQuery(query)({ tags: tag })).toBe(true)
    expect(prepareArticleQuery(query)({ tags: "other", content: tag })).toBe(false)
  },
)
it("著者名中のORを演算子とせず、引用語と通常のORを組み合わせる", () => {
  const author = "A or B"
  const query = normalizeArticleSearchText(`${buildArticleSearchTerm("@", author)} #missing OR #ruby`)
  expect(prepareArticleQuery(query)({ author, tags: "ruby" })).toBe(true)
  expect(prepareArticleQuery(query)({ author: "A", tags: "missing" })).toBe(false)
})

it.each(["<Ruby>", "&copy;", "&#35;Ruby"])("検索入力の表示文字をHTMLとして解釈しない: %s", (literal) => {
  const query = normalizeArticleSearchText(literal)
  expect(query).toBe(literal.toLowerCase())
  expect(prepareArticleQuery(query)({ title: literal })).toBe(true)
  expect(prepareArticleQuery(query)({ title: "無関係", content: "<p>本文</p>" })).toBe(false)
})

it.each(["title", "author", "tags"])("プレーンテキストの%sとHTML本文の境界を保つ", (field) => {
  const article = { [field]: "<Ruby> &copy;", content: "<p>Ru<strong>by</strong> &copy; &lt;Rails&gt;</p>" }
  const matches = (query) => prepareArticleQuery(normalizeArticleSearchText(query))(article)
  expect(matches('"<Ruby> &copy;"')).toBe(true)
  expect(matches("Ruby © <Rails>")).toBe(true)
  expect(matches("strong")).toBe(false)
  expect(prepareArticleQuery(normalizeArticleSearchText("<Ruby>"))({ [field]: "<Ruby>" })).toBe(true)
  expect(prepareArticleQuery(normalizeArticleSearchText("©"))({ [field]: "&copy;" })).toBe(false)
})

it.each(["<Ruby>", "&copy;", 'A <B> or "C"\\D'])("タグ・著者の選択条件を表示文字のまま評価する: %s", (literal) => {
  for (const [prefix, field] of [
    ["#", "tags"],
    ["@", "author"],
  ]) {
    const query = normalizeArticleSearchText(buildArticleSearchTerm(prefix, literal))
    expect(prepareArticleQuery(query)({ [field]: literal })).toBe(true)
    expect(prepareArticleQuery(query)({ [field]: "other", content: literal })).toBe(false)
  }
})
