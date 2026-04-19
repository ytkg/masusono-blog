import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import SettingsApp from "./SettingsApp"

vi.mock("../shared/AppsDrawerLauncher", () => ({
  default: ({ title, onOpen, children }) => (
    <div>
      <button onClick={() => void onOpen()}>{title}</button>
      {children}
    </div>
  ),
}))

describe("SettingsApp", () => {
  beforeEach(() => {
    document.cookie = "user_id=cookie-user; Path=/"
  })

  afterEach(() => {
    document.cookie = "user_id=; Max-Age=0; Path=/"
    vi.unstubAllGlobals()
  })

  it("open 時に現在のユーザー名を取得する", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ name: "表示名太郎" }),
    })
    vi.stubGlobal("fetch", fetch)

    render(<SettingsApp />)
    fireEvent.click(screen.getByRole("button", { name: "設定" }))

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/app/users/cookie-user.json", {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
    })
    expect(await screen.findByText("表示名太郎")).toBeInTheDocument()
  })

  it("保存時に名前を POST する", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ name: "現在名" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })
    vi.stubGlobal("fetch", fetch)

    render(<SettingsApp />)
    fireEvent.click(screen.getByRole("button", { name: "設定" }))
    await screen.findByText("現在名")

    fireEvent.click(screen.getByRole("button", { name: "変更" }))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  新しい名前  " } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith("/api/app/users.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name: "新しい名前", userId: "cookie-user" }),
      })
    })
    expect(await screen.findByText("新しい名前")).toBeInTheDocument()
  })

  it("空の表示名はバリデーションエラーにする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ name: "現在名" }),
      }),
    )

    render(<SettingsApp />)
    fireEvent.click(screen.getByRole("button", { name: "設定" }))
    await screen.findByText("現在名")

    fireEvent.click(screen.getByRole("button", { name: "変更" }))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "   " } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    expect(await screen.findByText("表示名を入力してください")).toBeInTheDocument()
  })
})
