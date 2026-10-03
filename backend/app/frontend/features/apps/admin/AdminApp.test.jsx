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
})
