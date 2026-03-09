import { describe, expect, it } from "vitest"
import { CFG } from "./constants"
import { resizeCanvas } from "./canvas"

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
})
