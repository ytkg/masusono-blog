import { act, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import useSentenceFeedLayout from "./useSentenceFeedLayout"

afterEach(() => vi.unstubAllGlobals())
it("reflows on window resize without ResizeObserver and resets an empty feed", () => {
  vi.stubGlobal("ResizeObserver", undefined)
  const container = document.createElement("div")
  const card = document.createElement("div")
  card.className = "sentence-card"
  let cardHeight = 20
  Object.defineProperty(card, "offsetHeight", { get: () => cardHeight })
  Object.defineProperty(container, "clientWidth", { value: 200 })
  container.append(card)
  const { result, rerender, unmount } = renderHook(({ items }) => useSentenceFeedLayout(items), {
    initialProps: { items: [] },
  })
  result.current.containerRef.current = container
  rerender({ items: [{ id: "a" }] })
  expect(result.current.height).toBeCloseTo(20)
  cardHeight = 40
  act(() => window.dispatchEvent(new Event("resize")))
  expect(result.current.height).toBeCloseTo(40)
  rerender({ items: [] })
  expect(result.current.height).toBe(0)
  unmount()
  const transform = card.style.transform
  act(() => window.dispatchEvent(new Event("resize")))
  expect(card.style.transform).toBe(transform)
})
