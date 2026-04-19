import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Home from "./home"

vi.mock("../features/home/HomeHero", () => ({
  default: ({ formattedNow }) => <div>hero:{formattedNow}</div>,
}))

vi.mock("../features/home/HomeFeatureLinks", () => ({
  default: () => <div>links</div>,
}))

vi.mock("../features/home/HomeAppLaunchers", () => ({
  default: () => <div>apps</div>,
}))

vi.mock("../shared/SeoHead", () => ({
  default: () => <div>seo</div>,
}))

vi.mock("@/shared/lib/userId", () => ({
  ensureUserIdCookie: vi.fn(),
}))

describe("Home page", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-03-09T10:00:00+09:00"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("時刻表示を更新し user_id cookie を確保する", async () => {
    const { ensureUserIdCookie } = await import("@/shared/lib/userId")

    render(<Home />)

    expect(ensureUserIdCookie).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/hero:/)).toBeInTheDocument()
    expect(screen.getByText("apps")).toBeInTheDocument()
    expect(screen.getByText("links")).toBeInTheDocument()

    vi.setSystemTime(new Date("2026-03-09T10:00:01+09:00"))
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByText(/10:00:0[12]/)).toBeInTheDocument()
  })
})
