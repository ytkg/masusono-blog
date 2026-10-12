import { afterEach, describe, expect, it, vi } from "vitest"
import {
  appendSentenceItems,
  createInitialSentenceState,
  firstSentenceFromHtml,
  markSentenceItemsRevealed,
  mergeSentenceArticleSources,
  prepareSentenceArticles,
} from "./sentenceFeedData"

afterEach(() => vi.restoreAllMocks())

describe("sentenceFeedData", () => {
  it("本文の最初の一文を抽出する", () => {
    expect(firstSentenceFromHtml("<p>最初の一文です。</p><p>次の文です。</p>")).toBe("最初の一文です。")
    expect(firstSentenceFromHtml("<p>改行まで</p><p>次の段落</p>")).toBe("改行まで")
  })

  it("文字参照・br・引用符を含む書き出しを抽出する", () => {
    expect(firstSentenceFromHtml("<p>&copy; 最初の行<br>次の行</p>")).toBe("© 最初の行")
    expect(firstSentenceFromHtml("<p>「こんにちは。」と言った。次の文。</p>")).toBe("「こんにちは。」と言った。")
  })

  it("書き出しの初期状態と追加状態を記事IDで保持する", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5)
    const articles = [
      { id: "first", content: "<p>一つ目です。</p>" },
      { id: "second", content: "<p>二つ目です。</p>" },
    ]

    const sentenceArticles = prepareSentenceArticles(articles)
    const initial = createInitialSentenceState(sentenceArticles)
    const source = initial.sourceIds.map((id) => sentenceArticles.find((article) => article.id === id))
    const revealed = markSentenceItemsRevealed(initial)
    const appended = appendSentenceItems(revealed, source)

    expect(initial.items).toHaveLength(80)
    expect(initial.items.every((item) => item.articleId)).toBe(true)
    expect(revealed.items.every((item) => item.hasRevealed)).toBe(true)
    expect(appended.state.items).toHaveLength(104)
    expect(appended.state.nextCursor).toBe(104)
    expect(appended.state.items.slice(0, 80).every((item) => item.hasRevealed)).toBe(true)
    expect(appended.state.items.slice(80).every((item) => !item.hasRevealed)).toBe(true)
  })

  it("大きい記事群でも未取得ページがある間は巡回せず、最終ページを表示してから次の巡に進む", () => {
    const articles = Array.from({ length: 110 }, (_, index) => ({ id: `article-${index}`, sentence: `記事${index}。` }))
    let state = createInitialSentenceState(articles.slice(0, 100), true)
    let source = state.sourceIds.map((id) => articles.find((article) => article.id === id))
    expect(state.items).toHaveLength(80)
    ;({ state, source } = appendSentenceItems(state, source, true))
    expect(state.items).toHaveLength(100)
    ;({ state } = appendSentenceItems(state, source, true))
    expect(state.items).toHaveLength(100)
    expect(new Set(state.items.map((item) => item.articleId)).size).toBe(100)

    state = mergeSentenceArticleSources(state, articles, false)
    source = state.sourceIds.map((id) => articles.find((article) => article.id === id))
    ;({ state } = appendSentenceItems(state, source, false))
    expect(new Set(state.items.slice(0, 110).map((item) => item.articleId)).size).toBe(110)
    expect(state.items.slice(100, 110).map((item) => item.articleId)).toEqual(
      articles.slice(100).map((article) => article.id),
    )
    expect(state.items).toHaveLength(124)
  })
})
