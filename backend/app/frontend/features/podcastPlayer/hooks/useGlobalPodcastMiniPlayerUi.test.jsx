import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useCollapsedMiniPlayerDrag } from "./useCollapsedMiniPlayerDrag"
import { useGlobalPodcastMiniPlayerUi } from "./useGlobalPodcastMiniPlayerUi"

vi.mock("./useCollapsedMiniPlayerDrag", () => ({
  useCollapsedMiniPlayerDrag: vi.fn(),
}))

describe("useGlobalPodcastMiniPlayerUi", () => {
  it("collapse / expand と containerSx を制御する", () => {
    const resetPosition = vi.fn()
    const shouldExpandAfterClick = vi.fn().mockReturnValue(true)
    vi.mocked(useCollapsedMiniPlayerDrag).mockReturnValue({
      playerRef: { current: null },
      containerStyle: { top: "0px" },
      isCustomCollapsedPosition: false,
      startDrag: vi.fn(),
      shouldExpandAfterClick,
      resetPosition,
    })

    const { result, rerender } = renderHook(
      ({ hasCurrentEpisode }) => useGlobalPodcastMiniPlayerUi({ hasCurrentEpisode }),
      {
        initialProps: { hasCurrentEpisode: true },
      },
    )

    expect(result.current.isCollapsed).toBe(false)

    act(() => {
      result.current.collapse()
    })

    expect(result.current.isCollapsed).toBe(true)
    expect(result.current.containerSx.width).toBe("auto")

    act(() => {
      result.current.expand()
    })

    expect(shouldExpandAfterClick).toHaveBeenCalledTimes(1)
    expect(result.current.isCollapsed).toBe(false)

    rerender({ hasCurrentEpisode: false })

    expect(resetPosition).toHaveBeenCalledTimes(1)
    expect(result.current.isCollapsed).toBe(false)
  })
})
