import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { requestHomeFeed } from "@/shared/lib/homeNavigation"
import Home from "./home"

const rememberedStates = vi.hoisted(() => new Map())

vi.mock("@inertiajs/react", async (importOriginal) => {
  const React = await import("react")

  return {
    ...(await importOriginal()),
    router: { remember: vi.fn() },
    useRemember: (initialState, key) => {
      const [state, setState] = React.useState(() => rememberedStates.get(key) ?? initialState)
      const setRememberedState = (nextState) => {
        setState((currentState) => {
          const resolvedState = typeof nextState === "function" ? nextState(currentState) : nextState
          rememberedStates.set(key, resolvedState)
          return resolvedState
        })
      }

      return [state, setRememberedState]
    },
  }
})

vi.mock("../shared/SeoHead", () => ({
  default: () => <div>seo</div>,
}))

vi.mock("../features/blog/ArticlesList", () => ({
  default: ({ articles, emptyMessage, variant }) => (
    <div data-testid="articles-list">
      <a href="/articles/article-1" onClick={(event) => event.preventDefault()}>
        記事へ
      </a>
      <a href="/authors/author-1" onClick={(event) => event.preventDefault()}>
        著者へ
      </a>
      articles:{articles.length} variant:{variant}
      {emptyMessage ? ` empty:${emptyMessage}` : null}
    </div>
  ),
}))

vi.mock("../features/blog/SentenceFeed", () => ({
  default: ({ articles }) => <div data-testid="sentence-feed">articles:{articles.length}</div>,
}))

vi.mock("@/shared/lib/userId", () => ({
  ensureUserIdCookie: vi.fn(),
}))

describe("Home page", () => {
  afterEach(() => {
    rememberedStates.clear()
    window.sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it("ブログ記事一覧を表示し user_id cookie を確保する", async () => {
    const { ensureUserIdCookie } = await import("@/shared/lib/userId")

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(ensureUserIdCookie).toHaveBeenCalledTimes(1)
    expect(screen.getByText("seo")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "ブログ" })).not.toBeInTheDocument()
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:1 variant:divided")
    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "false")
    expect(screen.queryByRole("textbox", { name: "記事を検索" })).not.toBeInTheDocument()
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
  })

  it("タブを切り替えた時点でホームの表示状態を履歴へ保存する", async () => {
    const { router } = await import("@inertiajs/react")
    router.remember.mockClear()

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))

    expect(router.remember).toHaveBeenLastCalledWith({ mode: "feed", version: 2 }, "home-state")
  })

  it("履歴から戻ったホームでも直前に選んだタブを復元する", () => {
    const screenOne = render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    screenOne.unmount()
    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "true")
  })

  it("削除済みタブの履歴状態はフィードへフォールバックする", () => {
    rememberedStates.set("home-state", {
      mode: "retired-tab",
      version: 1,
    })

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
  })

  it("書き出しからフィードへ切り替えた後に別ページから戻るとフィードを復元する", () => {
    const home = render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))
    home.unmount() // 著者ページへ遷移
    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />) // 戻る

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
  })

  it("別ページからホームを明示的に開く場合はフィードから表示する", () => {
    rememberedStates.set("home-state", {
      mode: "beginnings",
      version: 1,
    })
    requestHomeFeed()

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "false")

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))

    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "true")
  })

  it("明示的なホーム遷移の初期化後も、次の戻るではフィードを復元する", () => {
    rememberedStates.set("home-state", {
      mode: "beginnings",
      version: 1,
    })
    requestHomeFeed()
    const home = render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    home.unmount() // 記事ページへ遷移
    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />) // 戻る

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
  })
})
