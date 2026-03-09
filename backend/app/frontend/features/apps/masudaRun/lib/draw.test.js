import { describe, expect, it, vi } from "vitest"
import { drawCenterText, drawCloud } from "./draw"

describe("drawCenterText", () => {
  it("中央寄せで fillText する", () => {
    const ctx = {
      measureText: vi.fn().mockReturnValue({ width: 80 }),
      fillText: vi.fn(),
    }

    drawCenterText(ctx, 300, 120, "Hello")

    expect(ctx.fillText).toHaveBeenCalledWith("Hello", 110, 60)
  })
})

describe("drawCloud", () => {
  it("複数の楕円を描画する", () => {
    const ctx = {
      beginPath: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      fillStyle: "",
    }

    drawCloud(ctx, 10, 20, 100, 40)

    expect(ctx.ellipse).toHaveBeenCalledTimes(5)
    expect(ctx.fill).toHaveBeenCalledTimes(5)
  })
})
