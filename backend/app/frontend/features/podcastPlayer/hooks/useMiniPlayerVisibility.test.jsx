import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { useMiniPlayerVisibility } from "./useMiniPlayerVisibility"

describe("useMiniPlayerVisibility", () => {
  it("visibility helper の結果を返す", () => {
    const { result, rerender } = renderHook(
      ({ currentEpisodeId }) =>
        useMiniPlayerVisibility({
          currentEpisodeId,
        }),
      {
        initialProps: { currentEpisodeId: null },
      },
    )

    expect(result.current).toEqual({
      isVisible: false,
      reason: "NO_CURRENT_EPISODE",
    })

    rerender({ currentEpisodeId: "ep-10" })

    expect(result.current).toEqual({
      isVisible: true,
      reason: "HAS_CURRENT_EPISODE",
    })
  })
})
