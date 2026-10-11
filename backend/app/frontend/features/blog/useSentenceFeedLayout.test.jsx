import { renderHook } from "@testing-library/react"
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
