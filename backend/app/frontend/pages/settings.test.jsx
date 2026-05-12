import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Settings from "./settings"

vi.mock("../shared/SeoHead", () => ({
  default: () => null,
}))

describe("Settings page", () => {
  beforeEach(() => {
    document.cookie = "user_id=cookie-user; Path=/"
  })

  afterEach(() => {
    document.cookie = "user_id=; Max-Age=0; Path=/"
    vi.unstubAllGlobals()
  })

  it("表示名設定をページとして表示し、現在のユーザー名を取得する", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ name: "表示名太郎" }),
    })
    vi.stubGlobal("fetch", fetch)

    render(<Settings />)

    expect(screen.getByRole("heading", { name: "設定" })).toBeInTheDocument()
    expect(screen.getByText("表示名")).toBeInTheDocument()
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/app/users/cookie-user.json", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
    })
    expect(await screen.findByText("表示名太郎")).toBeInTheDocument()
  })
})
