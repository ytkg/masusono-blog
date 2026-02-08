import { act, renderHook } from "@testing-library/react"
import { type MockedFunction, afterEach, describe, expect, it, vi } from "vitest"
import { useCollapsedMiniPlayerDrag } from "./useCollapsedMiniPlayerDrag"
import { useGlobalPodcastMiniPlayerUi } from "./useGlobalPodcastMiniPlayerUi"

vi.mock("./useCollapsedMiniPlayerDrag", () => ({
  useCollapsedMiniPlayerDrag: vi.fn(),
}))

const useCollapsedMiniPlayerDragMock = useCollapsedMiniPlayerDrag as unknown as MockedFunction<
  typeof useCollapsedMiniPlayerDrag
>

function createDragHookResult(overrides: Partial<ReturnType<typeof useCollapsedMiniPlayerDrag>> = {}) {
  return {
    playerRef: { current: null },
    containerStyle: undefined,
    isCustomCollapsedPosition: false,
    startDrag: vi.fn(),
    shouldExpandAfterClick: vi.fn(() => true),
    resetPosition: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useCollapsedMiniPlayerDrag>
}

describe("useGlobalPodcastMiniPlayerUi", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("collapseで縮小状態に遷移し、expandで展開状態に戻る", () => {
    useCollapsedMiniPlayerDragMock.mockReturnValue(createDragHookResult())

    const { result } = renderHook(() => useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode: true }))

    expect(result.current.isCollapsed).toBe(false)

    act(() => {
      result.current.collapse()
    })
    expect(result.current.isCollapsed).toBe(true)

    act(() => {
      result.current.expand()
    })
    expect(result.current.isCollapsed).toBe(false)
  })

  it("ドラッグ直後など shouldExpandAfterClick が false のときは展開しない", () => {
    const shouldExpandAfterClick = vi.fn(() => false)
    useCollapsedMiniPlayerDragMock.mockReturnValue(createDragHookResult({ shouldExpandAfterClick }))

    const { result } = renderHook(() => useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode: true }))

    act(() => {
      result.current.collapse()
    })
    expect(result.current.isCollapsed).toBe(true)

    act(() => {
      result.current.expand()
    })

    expect(shouldExpandAfterClick).toHaveBeenCalledTimes(1)
    expect(result.current.isCollapsed).toBe(true)
  })

  it("エピソード未選択になると縮小状態とカスタム位置をリセットする", () => {
    const resetPosition = vi.fn()
    useCollapsedMiniPlayerDragMock.mockReturnValue(createDragHookResult({ resetPosition }))

    const { result, rerender } = renderHook(
      ({ hasCurrentEpisode }) => useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode }),
      { initialProps: { hasCurrentEpisode: true } },
    )

    act(() => {
      result.current.collapse()
    })
    expect(result.current.isCollapsed).toBe(true)

    rerender({ hasCurrentEpisode: false })

    expect(result.current.isCollapsed).toBe(false)
    expect(resetPosition).toHaveBeenCalledTimes(1)
  })
})
