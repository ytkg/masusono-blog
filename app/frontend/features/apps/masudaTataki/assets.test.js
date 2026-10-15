import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { IMAGES, loadImages } from "./assets"

let images
beforeEach(() => {
  images = []
  vi.stubGlobal(
    "Image",
    class {
      constructor() {
        images.push(this)
      }
    },
  )
})
afterEach(() => vi.unstubAllGlobals())

describe("たたきの画像読込", () => {
  it("全画像の成功まで待つ", async () => {
    const ready = vi.fn()
    const task = loadImages().then(ready)
    expect(images.map((image) => image.src)).toEqual(IMAGES)
    images[0].onload()
    await Promise.resolve()
    expect(ready).not.toHaveBeenCalled()
    images.slice(1).forEach((image) => image.onload())
    await task
    expect(ready).toHaveBeenCalledOnce()
  })

  it("離脱時にpending画像のイベントを解除し、loading taskを終了する", async () => {
    const controller = new AbortController()
    const task = loadImages({ signal: controller.signal })
    controller.abort()
    expect(images.every((image) => image.onload === null && image.onerror === null)).toBe(true)
    await expect(task).resolves.toEqual([null, null, null])
  })
})
