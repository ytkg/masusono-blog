import { act, renderHook } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import usePageVisible from "./usePageVisible"

afterEach(() => vi.restoreAllMocks())

it("初期非表示と表示の切り替えを反映し、アンマウント時に購読を解除する", () => {
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden")
  const remove = vi.spyOn(document, "removeEventListener")
  const { result, unmount } = renderHook(() => usePageVisible())
  expect(result.current).toBe(false)
  visibility.mockReturnValue("visible")
  act(() => document.dispatchEvent(new Event("visibilitychange")))
  expect(result.current).toBe(true)
  visibility.mockReturnValue("hidden")
  act(() => document.dispatchEvent(new Event("visibilitychange")))
  expect(result.current).toBe(false)
  unmount()
  expect(remove).toHaveBeenCalledWith("visibilitychange", expect.any(Function))
})
