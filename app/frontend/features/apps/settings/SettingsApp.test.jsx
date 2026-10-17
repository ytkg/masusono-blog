import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { StrictMode } from "react"
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
        signal: expect.any(AbortSignal),
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
        headers: expect.any(Headers),
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

  it("購読状態の確認中は操作を無効化する", async () => {
    let resolveState
    getWebPushState.mockReturnValue(new Promise((resolve) => (resolveState = resolve)))
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ name: "現在名" }) }))

    render(<SettingsContent loadOnMount />)

    expect(screen.getByRole("switch", { name: "新着記事の通知" })).toBeDisabled()
    resolveState({ supported: true, subscribed: true, permission: "granted" })
    await waitFor(() => expect(screen.getByRole("switch", { name: "新着記事の通知" })).toBeEnabled())
    expect(screen.getByRole("switch", { name: "新着記事の通知" })).toBeChecked()
  })

  it("購読状態の取得失敗をブラウザ非対応として表示しない", async () => {
    getWebPushState.mockRejectedValue(new Error("lookup failed"))
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ name: "現在名" }) }))

    render(<SettingsContent loadOnMount />)

    expect(await screen.findByText("通知設定の取得に失敗しました")).toBeInTheDocument()
    expect(screen.queryByText("このブラウザは通知に対応していません。")).not.toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole("switch", { name: "新着記事の通知" })).toBeEnabled())
  })

  it("通知拒否済みではスイッチを無効化して案内する", async () => {
    getWebPushState.mockResolvedValue({ supported: true, subscribed: false, permission: "denied" })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ name: "現在名" }) }))

    render(<SettingsContent loadOnMount />)

    expect(await screen.findByText("ブラウザのサイト設定から通知を許可してください。")).toBeInTheDocument()
    expect(screen.getByRole("switch", { name: "新着記事の通知" })).toBeDisabled()
  })
  it("現在のCookieのIDをユーザーIDとして表示する", () => {
    render(<SettingsContent />)
    expect(screen.getByText("ユーザーID：cookie-user")).toBeInTheDocument()
  })
  it("編集開始後の遅い取得結果で入力や保存済みの名前を上書きしない", async () => {
    let resolveLoad
    const fetch = vi
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveLoad = resolve
        }),
      )
      .mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal("fetch", fetch)
    render(<SettingsContent loadOnMount />)
    fireEvent.click(screen.getByRole("button", { name: "変更" }))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "編集中" } })
    await act(async () => resolveLoad({ ok: true, json: async () => ({ name: "古い名前" }) }))
    expect(screen.getByRole("textbox")).toHaveValue("編集中")
    fireEvent.click(screen.getByRole("button", { name: "保存" }))
    expect(await screen.findByText("編集中")).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("保存の後に初期取得が完了しても保存済み表示を維持する", async () => {
    let resolveLoad
    const fetch = vi
      .fn()
      .mockReturnValueOnce(
        new Promise((resolve) => {
          resolveLoad = resolve
        }),
      )
      .mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal("fetch", fetch)
    render(<SettingsContent loadOnMount />)
    fireEvent.click(screen.getByRole("button", { name: "変更" }))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "保存した名前" } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))
    await screen.findByText("保存した名前")
    await act(async () => resolveLoad({ ok: true, json: async () => ({ name: "保存前の名前" }) }))
    expect(screen.getByText("保存した名前")).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("保存中は送信した入力を固定し、失敗後は入力を残して再試行できる", async () => {
    let rejectSave
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ name: "現在名" }) })
      .mockReturnValueOnce(
        new Promise((_, reject) => {
          rejectSave = reject
        }),
      )
      .mockResolvedValue({ ok: true, json: async () => ({}) })
    vi.stubGlobal("fetch", fetch)
    render(<SettingsContent loadOnMount />)
    await screen.findByText("現在名")
    fireEvent.click(screen.getByRole("button", { name: "変更" }))
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  再送する名前  " } })
    fireEvent.click(screen.getByRole("button", { name: "保存" }))
    expect(screen.getByRole("textbox")).toBeDisabled()
    expect(screen.getByRole("button", { name: "保存中..." })).toBeDisabled()
    await act(async () => rejectSave(new Error("failed")))
    expect(screen.getByText("表示名の保存に失敗しました")).toBeInTheDocument()
    expect(screen.getByRole("textbox")).toBeEnabled()
    expect(screen.getByRole("textbox")).toHaveValue("  再送する名前  ")
    fireEvent.click(screen.getByRole("button", { name: "保存" }))
    expect(await screen.findByText("再送する名前")).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(3)
  })

  it("StrictModeの古い取得を無効化し、離脱時に現在の取得も中止する", async () => {
    const requests = []
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url, options) =>
          new Promise((resolve) => {
            requests.push({ ...options, resolve })
          }),
      ),
    )
    const view = render(
      <StrictMode>
        <SettingsContent loadOnMount />
      </StrictMode>,
    )
    expect(requests).toHaveLength(2)
    expect(requests[0].signal.aborted).toBe(true)
    await act(async () => requests[1].resolve({ ok: true, json: async () => ({ name: "最新名" }) }))
    await act(async () => requests[0].resolve({ ok: true, json: async () => ({ name: "古い名前" }) }))
    expect(screen.getByText("最新名")).toBeInTheDocument()
    view.unmount()
    expect(requests[1].signal.aborted).toBe(true)
  })
})
