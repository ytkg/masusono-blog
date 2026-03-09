import { renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { usePreventBodyScroll } from "./usePreventBodyScroll"

describe("usePreventBodyScroll", () => {
  it("マウント中だけ html/body の overflow を hidden にする", () => {
    document.documentElement.style.overflow = "scroll"
    document.body.style.overflow = "auto"

    const { unmount } = renderHook(() => usePreventBodyScroll())

    expect(document.documentElement.style.overflow).toBe("hidden")
    expect(document.body.style.overflow).toBe("hidden")

    unmount()

    expect(document.documentElement.style.overflow).toBe("scroll")
    expect(document.body.style.overflow).toBe("auto")
  })
})
