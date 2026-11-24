import { describe, expect, it } from "vitest"
import { appendUniqueById } from "./appendUniqueById"

describe("appendUniqueById", () => {
  it("既存記事を維持し、既存ページと追加ページ内の重複を除く", () => {
    const existing = { id: "a", title: "元の記事" }
    const firstNew = { id: "b", title: "最初の追加記事" }
    const lastNew = { id: "c", title: "末尾" }
    const items = Object.freeze([Object.freeze(existing)])
    const moreItems = Object.freeze([
      Object.freeze({ id: "a", title: "重複" }),
      Object.freeze(firstNew),
      Object.freeze({ id: "b", title: "追加ページ内の重複" }),
      Object.freeze(lastNew),
    ])

    const result = appendUniqueById(items, moreItems)

    expect(result).toEqual([existing, firstNew, lastNew])
    expect(result[0]).toBe(existing)
    expect(result[1]).toBe(firstNew)
    expect(items).toEqual([existing])
    expect(moreItems).toHaveLength(4)
  })

  it("初回取得でも同一IDの先頭だけを残す", () => {
    expect(
      appendUniqueById(
        [],
        [
          { id: "a", title: "先" },
          { id: "a", title: "後" },
        ],
      ),
    ).toEqual([{ id: "a", title: "先" }])
  })

  it("空ページでも既存記事を保持した新しい配列を返す", () => {
    const items = [{ id: "a" }]
    const result = appendUniqueById(items, [])

    expect(result).toEqual(items)
    expect(result).not.toBe(items)
  })

  it("連続ページにまたがる重複も除外する", () => {
    const first = appendUniqueById([{ id: "a" }], [{ id: "b" }])

    expect(appendUniqueById(first, [{ id: "a" }, { id: "b" }, { id: "c" }])).toEqual([
      { id: "a" },
      { id: "b" },
      { id: "c" },
    ])
  })
})
