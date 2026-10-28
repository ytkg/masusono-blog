import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import useVisibleHealthPhrase from "./useVisibleHealthPhrase"

let frames
let observers
let fonts
let originalFonts

beforeEach(() => {
  frames = new Map()
  observers = []
  let nextId = 0
  vi.stubGlobal("requestAnimationFrame", (callback) => {
    frames.set(++nextId, callback)
    return nextId
  })
  vi.stubGlobal("cancelAnimationFrame", (id) => frames.delete(id))
  for (const name of ["MutationObserver", "ResizeObserver"]) {
    vi.stubGlobal(
      name,
      class {
        observe = vi.fn()
        disconnect = vi.fn()
        constructor() {
          observers.push(this)
        }
      },
    )
  }
  originalFonts = Object.getOwnPropertyDescriptor(document, "fonts")
  fonts = new EventTarget()
  Object.defineProperty(document, "fonts", { configurable: true, value: fonts })
})

afterEach(() => {
  if (originalFonts) Object.defineProperty(document, "fonts", originalFonts)
  else delete document.fonts
  vi.unstubAllGlobals()
})

function nextFrame() {
  const [id, callback] = frames.entries().next().value
  frames.delete(id)
  act(() => callback())
}

it.each(["scroll", "resize", "loadingdone"])(
  "%sの購読と予約済み描画を離脱時に解除し、再表示で監視を重複させない",
  (event) => {
    const target = event === "loadingdone" ? fonts : window
    const dispatch = () => act(() => target.dispatchEvent(new Event(event)))
    const first = renderHook(() => useVisibleHealthPhrase())
    let second
    try {
      expect(observers).toHaveLength(2)
      expect(observers[0].observe).toHaveBeenCalledWith(
        document.body,
        expect.objectContaining({ subtree: true, childList: true }),
      )
      expect(observers[1].observe).toHaveBeenCalledWith(document.body)
      nextFrame()
      dispatch()
      expect(frames.size).toBe(1)
      first.unmount()
      expect(frames.size).toBe(0)
      for (const observer of observers) expect(observer.disconnect).toHaveBeenCalledOnce()
      dispatch()
      expect(frames.size).toBe(0)

      second = renderHook(() => useVisibleHealthPhrase())
      nextFrame()
      dispatch()
      expect(frames.size).toBe(1)
      nextFrame()
      second.unmount()
      expect(observers).toHaveLength(4)
      for (const observer of observers) expect(observer.disconnect).toHaveBeenCalledOnce()
      dispatch()
      expect(frames.size).toBe(0)
    } finally {
      first.unmount()
      second?.unmount()
    }
  },
)
