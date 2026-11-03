import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import AdminApp from "./AdminApp"
import { jsonResponse } from "@/test/jsonResponse"

afterEach(() => vi.unstubAllGlobals())

describe("AdminApp", () => {
  it("その他ページ内でログインからメディア一覧まで進む", async () => {
    const initialPath = window.location.pathname
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ authenticated: false, csrf_token: "csrf-1" }))
      .mockResolvedValueOnce(jsonResponse({ authenticated: true, csrf_token: "csrf-2" }))
      .mockResolvedValueOnce(jsonResponse({ media: [], total_count: 0, has_more: false, page: 1, query: "" }))
    vi.stubGlobal("fetch", fetch)

    render(<AdminApp />)
    fireEvent.click(screen.getByRole("button", { name: "管理を開く" }))

    expect(await screen.findByRole("button", { name: "ログイン" }, { timeout: 2_000 })).toBeInTheDocument()
    fireEvent.change(screen.getByRole("textbox", { name: "ユーザー名" }), { target: { value: "owner" } })
    fireEvent.change(document.querySelector('input[name="password"]'), { target: { value: "secret" } })
    fireEvent.click(screen.getByRole("button", { name: "ログイン" }))

    expect(await screen.findByRole("button", { name: "メディア一覧へ" })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith("/api/app/management/session", {
      cache: "no-store",
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-Token": "csrf-1" },
      body: JSON.stringify({ username: "owner", password: "secret" }),
    })

    fireEvent.click(screen.getByRole("button", { name: "メディア一覧へ" }))
    expect(await screen.findByText("メディアが見つかりませんでした。")).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledWith("/api/app/management/media?page=1", expect.any(Object))
    expect(window.location.pathname).toBe(initialPath)
  })

  it("ログイン済みならダッシュボードを開く", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ authenticated: true, csrf_token: "csrf" })))

    render(<AdminApp />)
    fireEvent.click(screen.getByRole("button", { name: "管理を開く" }))

    expect(await screen.findByRole("button", { name: "メディア一覧へ" }, { timeout: 2_000 })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "ログイン" })).not.toBeInTheDocument()
  })

  it("メディア取得で認証が切れたらミニアプリ内のログインへ戻る", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ authenticated: true, csrf_token: "csrf" }))
      .mockResolvedValueOnce(jsonResponse({ error: { code: "unauthorized", message: "ログインが必要です。" } }, 401))
    vi.stubGlobal("fetch", fetch)

    render(<AdminApp />)
    fireEvent.click(screen.getByRole("button", { name: "管理を開く" }))
    fireEvent.click(await screen.findByRole("button", { name: "メディア一覧へ" }, { timeout: 2_000 }))

    await waitFor(() => expect(screen.getByRole("button", { name: "ログイン" })).toBeInTheDocument())
  })
  it("認証状態の取得失敗を表示し、再試行で回復する", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(jsonResponse({ authenticated: true, csrf_token: "csrf" }))
    vi.stubGlobal("fetch", fetch)
    render(<AdminApp />)
    fireEvent.click(screen.getByRole("button", { name: "管理を開く" }))
    expect(
      await screen.findByText(
        "認証状態を確認できませんでした。時間をおいて再度お試しください。",
        {},
        { timeout: 2000 },
      ),
    ).toBeInTheDocument()
    fireEvent.click(await screen.findByRole("button", { name: "再試行" }, { timeout: 2000 }))
    expect(await screen.findByRole("button", { name: "記事一覧へ" })).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("ログイン失敗時に理由を表示し、パスワードを直して再試行できる", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ authenticated: false, csrf_token: "csrf" }))
      .mockResolvedValueOnce(jsonResponse({ error: { code: "unauthorized", message: "入力を確認してください" } }, 401))
      .mockResolvedValueOnce(jsonResponse({ authenticated: true, csrf_token: "new-csrf" }))
    vi.stubGlobal("fetch", fetch)
    render(<AdminApp />)
    fireEvent.click(screen.getByRole("button", { name: "管理を開く" }))
    await screen.findByRole("button", { name: "ログイン" }, { timeout: 2000 })
    fireEvent.change(screen.getByRole("textbox", { name: "ユーザー名" }), { target: { value: "owner" } })
    const password = document.querySelector('input[name="password"]')
    fireEvent.change(password, { target: { value: "wrong" } })
    fireEvent.click(screen.getByRole("button", { name: "ログイン" }))
    expect(await screen.findByText("入力を確認してください")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ログイン" })).toBeEnabled()
    fireEvent.change(password, { target: { value: "correct" } })
    fireEvent.click(screen.getByRole("button", { name: "ログイン" }))
    expect(await screen.findByRole("button", { name: "記事一覧へ" })).toBeInTheDocument()
    expect(fetch.mock.calls[2][1].body).toBe(JSON.stringify({ username: "owner", password: "correct" }))
  })
})
