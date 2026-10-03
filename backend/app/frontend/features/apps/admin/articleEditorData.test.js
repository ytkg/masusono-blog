import { describe, expect, it } from "vitest"
import { changedFields, comparableHtml, editorFields } from "./articleEditorData"

describe("article editor data", () => {
  it("公開日時を日本時間で表示し変更値をUTCに変換する", () => {
    const initial = editorFields({
      title: "元",
      content: "<p>本文</p>",
      published_at: "2026-01-01T00:00:00Z",
      author_id: "author-1",
    })
    expect(initial.publishedAt).toBe("2026-01-01T09:00:00")
    expect(changedFields({ ...initial, title: "修正", publishedAt: "2026-01-02T10:00:00" }, initial)).toEqual({
      title: "修正",
      publishedAt: "2026-01-02T01:00:00.000Z",
    })
  })
  it("未編集の本文・公開日時を再送しない", () => {
    const initial = editorFields({ title: "元", content: '<p><img src="/image.png" width="100"></p>' })
    expect(changedFields({ ...initial, author: "author-2" }, initial)).toEqual({ author: "author-2" })
  })
  it("表・埋め込み・画像属性の欠落を検出する", () => {
    expect(comparableHtml('<p><img src="/image.png" width="100"></p>')).not.toBe(
      comparableHtml('<p><img src="/image.png"></p>'),
    )
    expect(comparableHtml('<iframe src="https://example.com"></iframe>')).not.toBe(comparableHtml("<p></p>"))
    expect(comparableHtml("<p><b>本文</b></p>")).toBe(comparableHtml("<p><strong>本文</strong></p>"))
  })
})
