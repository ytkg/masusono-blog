import { describe, expect, it } from "vitest"
import {
  DEFAULT_AUTHOR,
  DEFAULT_YEAR_MONTH,
  filterArticles,
  getArticleAuthorOptions,
  getArticleYearMonthOptions,
} from "./articleFilterUtils"

describe("articleFilterUtils", () => {
  const articles = [
    {
      id: "a1",
      title: "東京ポイント",
      author: "その他1",
      publishedDate: "2025/10/02",
      content: "<p>ポイントを投資に回した</p>",
    },
    {
      id: "a2",
      title: "ラーメン日記",
      author: "増田",
      publishedDate: "2025/10/15",
      content: "<p>煮干しラーメンを食べた</p>",
    },
    {
      id: "a3",
      title: "美術館メモ",
      author: "その他1",
      publishedDate: "2025/09/28",
      content: "<p>展示を見に行った</p>",
    },
    { id: "a4", title: "雑記", author: "あいう", publishedDate: "2025/08/01", content: "<p>メモ</p>" },
  ]

  it("著者ごとの件数つき一覧を増田優先、その後辞書順で返す", () => {
    expect(getArticleAuthorOptions(articles)).toEqual([
      { name: "増田", count: 1 },
      { name: "あいう", count: 1 },
      { name: "その他1", count: 2 },
    ])
  })

  it("著者一覧は全件ぶんを残しつつ、件数は指定集合で計算できる", () => {
    const countedArticles = filterArticles({ articles, yearMonth: "2025/08" })

    expect(getArticleAuthorOptions(articles, countedArticles)).toEqual([
      { name: "増田", count: 0 },
      { name: "あいう", count: 1 },
      { name: "その他1", count: 0 },
    ])
  })

  it("著者で絞り込める", () => {
    expect(filterArticles({ articles, author: "その他1" }).map((article) => article.id)).toEqual(["a1", "a3"])
  })

  it("年月ごとの件数つき一覧を新しい順で返す", () => {
    expect(getArticleYearMonthOptions(articles)).toEqual([
      { yearMonth: "2025/10", count: 2 },
      { yearMonth: "2025/09", count: 1 },
      { yearMonth: "2025/08", count: 1 },
    ])
  })

  it("年月一覧は全件ぶんを残しつつ、件数は指定集合で計算できる", () => {
    const countedArticles = filterArticles({ articles, author: "その他1" })

    expect(getArticleYearMonthOptions(articles, countedArticles)).toEqual([
      { yearMonth: "2025/10", count: 1 },
      { yearMonth: "2025/09", count: 1 },
      { yearMonth: "2025/08", count: 0 },
    ])
  })

  it("著者と年月の AND 条件で絞り込める", () => {
    expect(filterArticles({ articles, author: "その他1", yearMonth: "2025/10" }).map((article) => article.id)).toEqual([
      "a1",
    ])
  })

  it("フィルタがなければ全件返す", () => {
    expect(filterArticles({ articles, author: DEFAULT_AUTHOR, yearMonth: DEFAULT_YEAR_MONTH })).toEqual(articles)
  })
})
