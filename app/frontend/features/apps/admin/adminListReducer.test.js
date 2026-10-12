import { describe, expect, it } from "vitest"
import { adminListReducer, initialAdminListState } from "./adminListReducer"

function loaded(state, items, page, append = false) {
  return adminListReducer(state, {
    type: "loaded",
    items,
    append,
    result: { page, has_more: page === 1, total_count: 21, next_token: page === 1 ? "next" : null },
  })
}

describe("adminListReducer", () => {
  it("検索を変えると一覧とカーソルをリセットし、記事の件数表示を保持する", () => {
    const previous = loaded(initialAdminListState, [{ id: "old" }], 1)
    const state = adminListReducer(previous, { type: "reset" })
    expect(state).toMatchObject({
      items: [],
      nextToken: null,
      hasMore: false,
      loading: true,
      loadingMore: false,
      totalCount: 21,
    })
    expect(previous.items).toEqual([{ id: "old" }])
  })

  it("メディア検索では件数表示もリセットする", () => {
    const state = adminListReducer(
      { ...initialAdminListState, totalCount: 21 },
      { type: "reset", resetTotalCount: true },
    )
    expect(state.totalCount).toBe(0)
  })

  it("追加ページを連結し、初回取得の全体件数を保持する", () => {
    const first = loaded(initialAdminListState, [{ id: "first" }], 1)
    const state = loaded(first, [{ id: "last" }], 2, true)
    expect(state).toMatchObject({
      items: [{ id: "first" }, { id: "last" }],
      page: 2,
      hasMore: false,
      nextToken: null,
      totalCount: 21,
    })
  })

  it("追加取得失敗後の再試行で既存一覧を保持し、エラーを解除する", () => {
    const first = loaded(initialAdminListState, [{ id: "first" }], 1)
    const failed = adminListReducer(first, { type: "failed", message: "取得失敗" })
    const state = adminListReducer(failed, { type: "moreStarted" })
    expect(state).toMatchObject({ items: [{ id: "first" }], loadingMore: true, error: null })
  })
})
