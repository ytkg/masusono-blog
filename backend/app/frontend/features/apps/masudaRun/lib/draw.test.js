import { describe, expect, it, vi } from "vitest"
import { drawCenterText, drawCloud, drawSky } from "./draw"

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
  it("立体感のある雲を描画する", () => {
    const bodyGradient = { addColorStop: vi.fn() }
    const highlightGradient = { addColorStop: vi.fn() }
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      closePath: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      fillStyle: "",
      createLinearGradient: vi.fn(() => bodyGradient),
      createRadialGradient: vi.fn(() => highlightGradient),
    }

    drawCloud(ctx, 10, 20, 100, 40)

    expect(ctx.bezierCurveTo).toHaveBeenCalledTimes(6)
    expect(ctx.createLinearGradient).toHaveBeenCalledWith(10, 20, 10, 60)
    expect(bodyGradient.addColorStop).toHaveBeenCalledTimes(3)
    expect(ctx.createRadialGradient).toHaveBeenCalledTimes(1)
    expect(highlightGradient.addColorStop).toHaveBeenCalledTimes(2)
    expect(ctx.fill).toHaveBeenCalledTimes(2)
  })
})

describe("drawSky", () => {
  it("青空のグラデーションを描画する", () => {
    const skyGradient = { addColorStop: vi.fn() }
    const ctx = {
      createLinearGradient: vi.fn(() => skyGradient),
      fillRect: vi.fn(),
      fillStyle: "",
    }

    drawSky(ctx, 900, 300)

    expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 0, 300)
    expect(skyGradient.addColorStop).toHaveBeenCalledTimes(5)
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 900, 300)
  })
})
