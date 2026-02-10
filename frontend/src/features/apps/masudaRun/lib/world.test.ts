import { describe, expect, it } from "vitest"
import { rectsIntersect } from "@/features/apps/masudaRun/lib"

describe("rectsIntersect", () => {
  it("重なっている場合は true を返す", () => {
    expect(rectsIntersect(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true)
  })

  it("接しているだけの場合は false を返す", () => {
    expect(rectsIntersect(0, 0, 10, 10, 10, 0, 10, 10)).toBe(false)
  })
})
