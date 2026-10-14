import { act, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import useSentenceFeedLayout from "./useSentenceFeedLayout"

afterEach(() => vi.unstubAllGlobals())
it("resets the height when a populated feed becomes empty", () => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  )
  const container = document.createElement("div")
  const card = document.createElement("div")
  card.className = "sentence-card"
  Object.defineProperty(card, "offsetHeight", { value: 20 })
  Object.defineProperty(container, "clientWidth", { value: 200 })
  container.append(card)
  const { result, rerender, unmount } = renderHook(({ items }) => useSentenceFeedLayout(items), {
    initialProps: { items: [] },
  })
  result.current.containerRef.current = container
  rerender({ items: [{ id: "a" }] })
  expect(result.current.height).toBeCloseTo(20)
  rerender({ items: [] })
  expect(result.current.height).toBe(0)
  unmount()
})

it("ResizeObserverなしでも画面サイズとフォント読み込み後にカード配置を再計算する", async () => {
  vi.stubGlobal("ResizeObserver", undefined)
  let loaded
  const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts")
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: {
      ready: new Promise((resolve) => {
        loaded = resolve
      }),
    },
  })
  let height = 20
  const container = document.createElement("div")
  const card = document.createElement("div")
  card.className = "sentence-card"
  Object.defineProperty(card, "offsetHeight", { get: () => height })
  Object.defineProperty(container, "clientWidth", { value: 200 })
  container.append(card)
  const { result, rerender, unmount } = renderHook(({ items }) => useSentenceFeedLayout(items), {
    initialProps: { items: [] },
  })
  try {
    result.current.containerRef.current = container
    rerender({ items: [{ id: "a" }] })
    expect(result.current.height).toBeCloseTo(20)
    height = 40
    act(() => window.dispatchEvent(new Event("resize")))
    expect(result.current.height).toBeCloseTo(40)
    height = 60
    await act(async () => loaded())
    expect(result.current.height).toBeCloseTo(60)
  } finally {
    unmount()
    if (originalFonts) Object.defineProperty(document, "fonts", originalFonts)
    else delete document.fonts
  }
})
