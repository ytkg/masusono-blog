import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import AdminArticleEditor from "./AdminArticleEditor"
import { jsonResponse } from "@/test/jsonResponse"

const article = {
  id: "article-1",
  title: "元タイトル",
  content: "<p>本文</p>",
  author_id: "author-1",
  published_at: "2026-01-01T00:00:00Z",
  status: "PUBLISH",
  editable: true,
  content_editable: true,
  revision: "revision",
}
const authors = [{ id: "author-1", name: "著者" }]
afterEach(() => vi.unstubAllGlobals())

function setup() {
  const onSaved = vi.fn()
  render(
    <AdminArticleEditor id="article-1" csrfToken="csrf" onBack={vi.fn()} onDirtyChange={vi.fn()} onSaved={onSaved} />,
  )
  return onSaved
}

async function editAndConfirm() {
  fireEvent.change(await screen.findByRole("textbox", { name: "タイトル" }), { target: { value: "修正タイトル" } })
  fireEvent.click(screen.getByRole("button", { name: "保存", exact: true }))
  expect(
    await screen.findByText("公開中の記事への変更は即時反映されます。公開ステータスは変更しません。"),
  ).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "保存する" }))
}

describe("AdminArticleEditor", () => {
  it("確認して変更した項目だけ保存し編集画面に留まる", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ article, authors }))
      .mockResolvedValueOnce(jsonResponse({ article: { ...article, title: "修正タイトル", revision: "new" }, authors }))
    vi.stubGlobal("fetch", fetch)
    const onSaved = setup()
    await editAndConfirm()
    expect(await screen.findByText("保存しました。")).toBeInTheDocument()
    expect(await screen.findByRole("textbox", { name: "タイトル" })).toHaveValue("修正タイトル")
    expect(fetch).toHaveBeenLastCalledWith(
      "/api/app/management/articles/article-1",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": "csrf" },
        body: JSON.stringify({ article: { title: "修正タイトル" }, revision: "revision" }),
      }),
    )
    expect(onSaved).toHaveBeenCalledOnce()
    expect(screen.getByRole("button", { name: "保存", exact: true })).toBeDisabled()
  })
  it("競合でも入力内容を残し再保存を止める", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ article, authors }))
        .mockResolvedValueOnce(
          jsonResponse({ error: { code: "article_conflict", message: "別の場所で更新されています。" } }, 409),
        ),
    )
    setup()
    await editAndConfirm()
    expect(await screen.findByText("別の場所で更新されています。")).toBeInTheDocument()
    expect(await screen.findByRole("textbox", { name: "タイトル" })).toHaveValue("修正タイトル")
    expect(screen.getByRole("button", { name: "保存", exact: true })).toBeDisabled()
    expect(screen.getByRole("button", { name: "再読み込み" })).toBeInTheDocument()
  })
  it("上流障害では入力を残して再送を止める", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ article, authors }))
        .mockResolvedValueOnce(
          jsonResponse({ error: { code: "articles_unavailable", message: "保存結果を確認できません。" } }, 502),
        ),
    )
    setup()
    await editAndConfirm()
    expect(await screen.findByRole("textbox", { name: "タイトル" })).toHaveValue("修正タイトル")
    expect(screen.getByRole("button", { name: "保存", exact: true })).toBeDisabled()
    expect(screen.getByRole("button", { name: "再読み込み" })).toBeInTheDocument()
  })
  it("公開中に下書きがある記事は編集しない", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ article: { ...article, status: "PUBLISH_AND_DRAFT", editable: false }, authors }),
        ),
    )
    setup()
    expect(await screen.findByText("この記事は編集対象外です。microCMS で確認してください。")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "保存", exact: true })).not.toBeInTheDocument()
  })
  it("本文の読み込みや無効化だけでは本文を変更しない", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ article: { ...article, content: "<ul><li>本文</li></ul>" }, authors }))
      .mockResolvedValueOnce(jsonResponse({ article: { ...article, title: "修正タイトル", revision: "new" }, authors }))
    vi.stubGlobal("fetch", fetch)
    setup()
    expect(await screen.findByRole("button", { name: "保存", exact: true })).toBeDisabled()
    await editAndConfirm()
    expect(await screen.findByText("保存しました。")).toBeInTheDocument()
    expect(JSON.parse(fetch.mock.calls[1][1].body).article).toEqual({ title: "修正タイトル" })
  })
  it("対応できない埋め込みを削らず本文編集を止める", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          article: { ...article, content: '<iframe src="https://example.com/embed"></iframe>' },
          authors,
        }),
      ),
    )
    setup()
    await waitFor(() => expect(screen.getByText(/本文の形式・装飾を安全に保存/)).toBeInTheDocument())
    expect(screen.queryByRole("textbox", { name: "本文" })).not.toBeInTheDocument()
  })
})
