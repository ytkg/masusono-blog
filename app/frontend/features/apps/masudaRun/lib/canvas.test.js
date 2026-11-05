import { afterEach, describe, expect, it, vi } from "vitest"
import { CFG } from "./constants"
import { resizeCanvas } from "./canvas"

afterEach(() => vi.unstubAllGlobals())

describe("resizeCanvas", () => {
  it("wrapper 幅から canvas と scale を更新する", () => {
    const wrap = { clientWidth: 450 }
    const canvas = { style: {}, width: 0, height: 0 }
    const scaleRef = { current: 0 }

    resizeCanvas(wrap, canvas, scaleRef)

    expect(scaleRef.current).toBe((450 * window.devicePixelRatio) / CFG.BASE_W)
    expect(canvas.style.width).toBe("450px")
    expect(canvas.width).toBe(Math.round(CFG.BASE_W * scaleRef.current))
  })

  it("wrapper の高さが不足する場合は canvas を縮小する", () => {
    const wrap = { clientWidth: 900, clientHeight: 200 }
    const canvas = { style: {}, width: 0, height: 0 }
    const scaleRef = { current: 0 }

    resizeCanvas(wrap, canvas, scaleRef)

    expect(canvas.style.width).toBe("600px")
    expect(canvas.style.height).toBe("200px")
  })
  it("ラッパーをまだ計測できない場合も基準サイズの描画領域を確保する", () => {
    const canvas = { style: {}, width: 0, height: 0 }
    resizeCanvas({ clientWidth: 0, clientHeight: 0 }, canvas, { current: 0 })
    expect(canvas.style.width).toBe(`${CFG.BASE_W}px`)
    expect(canvas.style.height).toBe(`${CFG.BASE_H}px`)
    expect(canvas.width).toBeGreaterThanOrEqual(CFG.BASE_W)
    expect(canvas.height).toBeGreaterThanOrEqual(CFG.BASE_H)
  })
})

it.each([undefined, 0, 0.5, 2])("DPRが%jでもCSSサイズを維持し、1倍以上の描画領域を確保する", (ratio) => {
  vi.stubGlobal("devicePixelRatio", ratio)
  const canvas = { style: {}, width: 0, height: 0 }
  const scale = { current: 0 }
  resizeCanvas({ clientWidth: CFG.BASE_W, clientHeight: CFG.BASE_H }, canvas, scale)
  const expectedRatio = ratio === 2 ? 2 : 1
  expect(canvas.style.width).toBe(`${CFG.BASE_W}px`)
  expect(canvas.style.height).toBe(`${CFG.BASE_H}px`)
  expect(canvas.width).toBe(CFG.BASE_W * expectedRatio)
  expect(canvas.height).toBe(CFG.BASE_H * expectedRatio)
  expect(scale.current).toBe(expectedRatio)
})
