import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Home from "./home"

vi.mock("../features/home/HomeHero", () => ({
  default: () => <div>hero</div>,
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
  it("主要セクションを表示し user_id cookie を確保する", async () => {
    const { ensureUserIdCookie } = await import("@/shared/lib/userId")

    render(<Home />)

    expect(ensureUserIdCookie).toHaveBeenCalledTimes(1)
    expect(screen.getByText("hero")).toBeInTheDocument()
    expect(screen.getByText("apps")).toBeInTheDocument()
    expect(screen.getByText("links")).toBeInTheDocument()
  })
})
