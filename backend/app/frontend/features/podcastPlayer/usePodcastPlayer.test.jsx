import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PodcastPlayerContext } from "./PodcastPlayerContext"
import { usePodcastPlayer } from "./usePodcastPlayer"

describe("usePodcastPlayer", () => {
  it("Provider 外ではエラーにする", () => {
    expect(() => renderHook(() => usePodcastPlayer())).toThrow(
      "usePodcastPlayer must be used within PodcastPlayerProvider",
    )
  })

  it("Provider 内では context を返す", () => {
    const value = { currentEpisode: { id: "ep-1" }, isPlaying: true }
    const wrapper = ({ children }) => (
      <PodcastPlayerContext.Provider value={value}>{children}</PodcastPlayerContext.Provider>
    )

    const { result } = renderHook(() => usePodcastPlayer(), { wrapper })

    expect(result.current).toBe(value)
  })
})
