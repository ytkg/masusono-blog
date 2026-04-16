import { describe, expect, it } from "vitest"
import { zukanEntries } from "./zukanData"

describe("zukanData", () => {
  it("表示に必要な図鑑項目を持つ", () => {
    expect(zukanEntries.length).toBeGreaterThan(0)

    const ids = new Set()

    for (const member of zukanEntries) {
      expect(member).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        title: expect.any(String),
        bio: expect.any(String),
        image: expect.any(String),
      })

      expect(member.id.trim()).not.toBe("")
      expect(member.name.trim()).not.toBe("")
      expect(member.title.trim()).not.toBe("")
      expect(member.bio.trim()).not.toBe("")
      expect(member.image.trim()).not.toBe("")
      expect(ids.has(member.id)).toBe(false)
      ids.add(member.id)
    }
  })
})
