import { afterEach, describe, expect, it, vi } from "vitest"
import { rememberInCurrentHistoryEntry } from "./rememberedState"

describe("rememberInCurrentHistoryEntry", () => {
  afterEach(() => {
    window.history.replaceState(null, "", "/")
  })

  it("現在の Inertia 履歴エントリーへ即時に状態を保存する", () => {
    window.history.replaceState(
      {
        page: {
          component: "home",
          rememberedState: { existing: { value: 1 } },
        },
        scrollRegions: [{ top: 100 }],
      },
      "",
      "/",
    )

    rememberInCurrentHistoryEntry("home-state", { mode: "beginnings" })

    expect(window.history.state).toEqual({
      page: {
        component: "home",
        rememberedState: {
          existing: { value: 1 },
          "home-state": { mode: "beginnings" },
        },
      },
      scrollRegions: [{ top: 100 }],
    })
  })

  it("Inertia のページ情報がない場合は何もしない", () => {
    window.history.replaceState(null, "", "/")

    rememberInCurrentHistoryEntry("home-state", { mode: "beginnings" })

    expect(window.history.state).toBeNull()
  })
})

it("直列化できない履歴データのエラーは隠さない", () => {
  window.history.replaceState({ page: {} }, "", "/")
  const error = new DOMException("not serializable", "DataCloneError")
  const replace = vi.spyOn(window.history, "replaceState").mockImplementation(() => {
    throw error
  })
  try {
    expect(() => rememberInCurrentHistoryEntry("invalid", {})).toThrow(error)
  } finally {
    replace.mockRestore()
    window.history.replaceState(null, "", "/")
  }
})
