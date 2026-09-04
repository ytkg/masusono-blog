import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SettingsContent } from "./SettingsApp"
import { getWebPushState, subscribeToWebPush } from "./webPush"

vi.mock("./webPush", () => ({
  getWebPushState: vi.fn(),
  subscribeToWebPush: vi.fn(),
  unsubscribeFromWebPush: vi.fn(),
}))

describe("SettingsContent", () => {
  beforeEach(() => {
    document.cookie = "user_id=cookie-user; Path=/"
    getWebPushState.mockResolvedValue({ supported: true, subscribed: false, permission: "default" })
    subscribeToWebPush.mockResolvedValue({ supported: true, subscribed: true, permission: "granted" })
  })

  afterEach(() => {
    document.cookie = "user_id=; Max-Age=0; Path=/"
    vi.unstubAllGlobals()
  })

  it("mount 時に現在のユーザー名を取得する", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ name: "表示名太郎" }),
    })
    vi.stubGlobal("fetch", fetch)

    render(<SettingsContent loadOnMount />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/app/users/cookie-user.json", {
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

    render(<SettingsContent loadOnMount />)
    await screen.findByText("現在名")

    fireEvent.click(screen.getByRole("button", { name: "変更" }))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  新しい名前  " } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith("/api/app/users.json", {
        cache: "no-store",
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

    render(<SettingsContent loadOnMount />)
    await screen.findByText("現在名")

    fireEvent.click(screen.getByRole("button", { name: "変更" }))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "   " } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    expect(await screen.findByText("表示名を入力してください")).toBeInTheDocument()
  })

  it("新着記事の通知をスイッチで有効にする", async () => {
    render(<SettingsContent />)

    fireEvent.click(screen.getByRole("switch", { name: "新着記事の通知" }))

    await waitFor(() => {
      expect(subscribeToWebPush).toHaveBeenCalledOnce()
    })
    expect(screen.getByRole("switch", { name: "新着記事の通知" })).toBeChecked()
    expect(screen.getByText("新しい記事が公開されたときに通知を受け取ります。")).toBeInTheDocument()
  })

  it("通知拒否済みではスイッチを無効化して案内する", async () => {
    getWebPushState.mockResolvedValue({ supported: true, subscribed: false, permission: "denied" })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ name: "現在名" }) }))

    render(<SettingsContent loadOnMount />)

    expect(await screen.findByText("ブラウザのサイト設定から通知を許可してください。")).toBeInTheDocument()
    expect(screen.getByRole("switch", { name: "新着記事の通知" })).toBeDisabled()
  })
})
