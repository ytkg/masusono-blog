import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useMasudaRunAssets } from "./useMasudaRunAssets"

describe("useMasudaRunAssets", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("画像読み込み完了時に ref を設定し、unmount で解除する", async () => {
    const images = []

    class MockImage {
      constructor() {
        images.push(this)
      }
    }

    vi.stubGlobal("Image", MockImage)

    const imgRef = { current: null }
    const obsShortRef = { current: null }
    const obsTallRef = { current: null }
    const { unmount } = renderHook(() =>
      useMasudaRunAssets({
        imgRef,
        obsShortRef,
        obsTallRef,
        sources: {
          player: "/player.png",
          short: "/short.png",
          tall: "/tall.png",
        },
      }),
    )

    images.forEach((image) => image.onload())
    await Promise.resolve()

    expect(imgRef.current.src).toBe("/player.png")
    expect(obsShortRef.current.src).toBe("/short.png")
    expect(obsTallRef.current.src).toBe("/tall.png")

    unmount()

    expect(imgRef.current).toBeNull()
    expect(obsShortRef.current).toBeNull()
    expect(obsTallRef.current).toBeNull()
  })
})

it("disposes pending image events and settles loading tasks on unmount", async () => {
  const images = []
  vi.stubGlobal(
    "Image",
    class {
      constructor() {
        images.push(this)
      }
    },
  )
  const tasks = []
  const refs = [{ current: null }, { current: null }, { current: null }]
  const { unmount } = renderHook(() =>
    useMasudaRunAssets({
      imgRef: refs[0],
      obsShortRef: refs[1],
      obsTallRef: refs[2],
      sources: { player: "p", short: "s", tall: "t" },
      registerLoadingTask: (task) => tasks.push(task),
    }),
  )
  unmount()
  images.forEach((image) => {
    expect(image.onload).toBeNull()
    expect(image.onerror).toBeNull()
  })
  await Promise.all(tasks)
  expect(refs.every((ref) => ref.current === null)).toBe(true)
  vi.unstubAllGlobals()
})

it("差替え前の画像はrefを上書きせず、失敗は他の画像の表示を妨げない", async () => {
  const images = []
  vi.stubGlobal(
    "Image",
    class {
      constructor() {
        images.push(this)
      }
    },
  )
  const refs = [{ current: null }, { current: null }, { current: null }]
  const tasks = []
  const registerLoadingTask = (task) => tasks.push(task)
  try {
    const { rerender, unmount } = renderHook(
      ({ player }) =>
        useMasudaRunAssets({
          imgRef: refs[0],
          obsShortRef: refs[1],
          obsTallRef: refs[2],
          sources: { player, short: "s", tall: "t" },
          registerLoadingTask,
        }),
      { initialProps: { player: "old" } },
    )
    const oldLoad = images[0].onload
    rerender({ player: "new" })
    images[3].onload()
    images[4].onerror()
    images[5].onload()
    oldLoad()
    await Promise.all(tasks)
    expect(refs[0].current.src).toBe("new")
    expect(refs[1].current).toBeNull()
    expect(refs[2].current.src).toBe("t")
    unmount()
    expect(refs.every((ref) => ref.current === null)).toBe(true)
  } finally {
    vi.unstubAllGlobals()
  }
})
