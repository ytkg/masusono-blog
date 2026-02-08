import { act, fireEvent, renderHook } from "@testing-library/react"
import type { PointerEvent as ReactPointerEvent } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useCollapsedMiniPlayerDrag } from "./useCollapsedMiniPlayerDrag"

type Rect = {
  left: number
  top: number
  width: number
  height: number
}

function mockRect(element: HTMLElement, rect: Rect) {
  vi.spyOn(element, "getBoundingClientRect").mockImplementation(
    () =>
      ({
        x: rect.left,
        y: rect.top,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
        toJSON: () => ({}),
      }) as DOMRect,
  )
}

function createPointerDownEvent(overrides: Partial<PointerEvent> = {}) {
  return {
    pointerId: 1,
    button: 0,
    pointerType: "mouse",
    clientX: 110,
    clientY: 110,
    preventDefault: vi.fn(),
    currentTarget: { setPointerCapture: vi.fn() },
    ...overrides,
  } as unknown as ReactPointerEvent<HTMLElement>
}

describe("useCollapsedMiniPlayerDrag", () => {
  const originalWidth = window.innerWidth
  const originalHeight = window.innerHeight

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { value: originalWidth, writable: true, configurable: true })
    Object.defineProperty(window, "innerHeight", { value: originalHeight, writable: true, configurable: true })
    vi.restoreAllMocks()
  })

  it("右クリックはドラッグ開始しない", () => {
    const { result } = renderHook(() => useCollapsedMiniPlayerDrag(true))
    const player = document.createElement("div")
    mockRect(player, { left: 100, top: 100, width: 70, height: 70 })
    result.current.playerRef.current = player

    act(() => {
      result.current.startDrag(
        createPointerDownEvent({
          button: 2,
          pointerType: "mouse",
        }),
      )
    })

    expect(result.current.isCustomCollapsedPosition).toBe(false)
    expect(result.current.containerStyle).toBeUndefined()
  })

  it("ドラッグ閾値3px以下はクリック展開を阻害しない", () => {
    const { result } = renderHook(() => useCollapsedMiniPlayerDrag(true))
    const player = document.createElement("div")
    mockRect(player, { left: 100, top: 100, width: 70, height: 70 })
    result.current.playerRef.current = player

    act(() => {
      result.current.startDrag(
        createPointerDownEvent({
          pointerId: 10,
          clientX: 110,
          clientY: 110,
        }),
      )
    })
    fireEvent.pointerMove(window, { pointerId: 10, clientX: 112, clientY: 112 })
    fireEvent.pointerUp(window, { pointerId: 10 })

    expect(result.current.shouldExpandAfterClick()).toBe(true)
  })

  it("ドラッグ閾値を超えると最初のクリック展開を阻害する", () => {
    const { result } = renderHook(() => useCollapsedMiniPlayerDrag(true))
    const player = document.createElement("div")
    mockRect(player, { left: 100, top: 100, width: 70, height: 70 })
    result.current.playerRef.current = player

    act(() => {
      result.current.startDrag(
        createPointerDownEvent({
          pointerId: 11,
          clientX: 110,
          clientY: 110,
        }),
      )
    })
    fireEvent.pointerMove(window, { pointerId: 11, clientX: 120, clientY: 120 })
    fireEvent.pointerUp(window, { pointerId: 11 })

    expect(result.current.shouldExpandAfterClick()).toBe(false)
    expect(result.current.shouldExpandAfterClick()).toBe(true)
  })

  it("ドラッグ位置は画面端にクランプされる", () => {
    Object.defineProperty(window, "innerWidth", { value: 300, writable: true, configurable: true })
    Object.defineProperty(window, "innerHeight", { value: 200, writable: true, configurable: true })

    const { result } = renderHook(() => useCollapsedMiniPlayerDrag(true))
    const player = document.createElement("div")
    mockRect(player, { left: 100, top: 80, width: 70, height: 70 })
    result.current.playerRef.current = player

    act(() => {
      result.current.startDrag(
        createPointerDownEvent({
          pointerId: 21,
          clientX: 110,
          clientY: 90,
        }),
      )
    })

    fireEvent.pointerMove(window, { pointerId: 21, clientX: -100, clientY: -100 })
    expect(result.current.containerStyle?.left).toBe("8px")
    expect(result.current.containerStyle?.top).toBe("8px")

    fireEvent.pointerMove(window, { pointerId: 21, clientX: 1000, clientY: 1000 })
    expect(result.current.containerStyle?.left).toBe("222px")
    expect(result.current.containerStyle?.top).toBe("122px")
  })

  it("resize時に現在位置を再クランプする", () => {
    Object.defineProperty(window, "innerWidth", { value: 400, writable: true, configurable: true })
    Object.defineProperty(window, "innerHeight", { value: 300, writable: true, configurable: true })

    const { result } = renderHook(() => useCollapsedMiniPlayerDrag(true))
    const player = document.createElement("div")
    mockRect(player, { left: 100, top: 80, width: 70, height: 70 })
    result.current.playerRef.current = player

    act(() => {
      result.current.startDrag(
        createPointerDownEvent({
          pointerId: 31,
          clientX: 110,
          clientY: 90,
        }),
      )
    })

    fireEvent.pointerMove(window, { pointerId: 31, clientX: 1000, clientY: 1000 })
    expect(result.current.containerStyle?.left).toBe("322px")
    expect(result.current.containerStyle?.top).toBe("222px")

    Object.defineProperty(window, "innerWidth", { value: 200, writable: true, configurable: true })
    Object.defineProperty(window, "innerHeight", { value: 150, writable: true, configurable: true })
    fireEvent(window, new Event("resize"))

    expect(result.current.containerStyle?.left).toBe("122px")
    expect(result.current.containerStyle?.top).toBe("72px")
  })
})
