import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { loadImage } from "./loadImage"

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
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("loadImage", () => {
  it("成功後にイベントと中断リスナーを解除し、重複イベントを無視する", async () => {
    const controller = new AbortController()
    const remove = vi.spyOn(controller.signal, "removeEventListener")
    const task = loadImage("/image.webp", { signal: controller.signal })
    const image = images[0]
    const onload = image.onload
    const onerror = image.onerror
    onload()
    onerror()
    controller.abort()
    await expect(task).resolves.toBe(image)
    expect(image.onload).toBeNull()
    expect(image.onerror).toBeNull()
    expect(remove).toHaveBeenCalledOnce()
  })

  it("読込失敗をrejectしてイベントを解除する", async () => {
    const task = loadImage("/image.webp")
    images[0].onerror()
    await expect(task).rejects.toThrow("画像を読み込めませんでした")
    expect(images[0].onload).toBeNull()
    expect(images[0].onerror).toBeNull()
  })

  it("中断時はloading taskを解決し、遅れた成功で画像を復活させない", async () => {
    const controller = new AbortController()
    const task = loadImage("/image.webp", { signal: controller.signal })
    const onload = images[0].onload
    controller.abort()
    onload()
    await expect(task).resolves.toBeNull()
    expect(images[0].onload).toBeNull()
    expect(images[0].onerror).toBeNull()
  })

  it("開始前に中断済みなら画像を作らない", async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(loadImage("/image.webp", { signal: controller.signal })).resolves.toBeNull()
    expect(images).toHaveLength(0)
  })
})
