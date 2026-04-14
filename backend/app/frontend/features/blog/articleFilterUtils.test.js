import { describe, expect, it } from "vitest"
import { DEFAULT_AUTHOR, filterArticles, getArticleAuthorOptions } from "./articleFilterUtils"

describe("articleFilterUtils", () => {
  const articles = [
    { id: "a1", title: "東京ポイント", author: "その他1", content: "<p>ポイントを投資に回した</p>" },
    { id: "a2", title: "ラーメン日記", author: "増田", content: "<p>煮干しラーメンを食べた</p>" },
    { id: "a3", title: "美術館メモ", author: "その他1", content: "<p>展示を見に行った</p>" },
    { id: "a4", title: "雑記", author: "あいう", content: "<p>メモ</p>" },
  ]

  it("著者ごとの件数つき一覧を増田優先、その後辞書順で返す", () => {
    expect(getArticleAuthorOptions(articles)).toEqual([
      { name: "増田", count: 1 },
      { name: "あいう", count: 1 },
      { name: "その他1", count: 2 },
    ])
  })

  it("著者で絞り込める", () => {
    expect(filterArticles({ articles, author: "その他1" }).map((article) => article.id)).toEqual(["a1", "a3"])
  })

  it("フィルタがなければ全件返す", () => {
    expect(filterArticles({ articles, author: DEFAULT_AUTHOR })).toEqual(articles)
  })
})
