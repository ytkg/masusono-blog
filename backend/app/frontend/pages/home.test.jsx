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
    expect(screen.getByRole("tab", { name: "おすすめ" })).toHaveAttribute("aria-selected", "false")
    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "false")
    expect(screen.queryByRole("textbox", { name: "記事を検索" })).not.toBeInTheDocument()
    expect(screen.queryByText("1件")).not.toBeInTheDocument()
  })

  it("おすすめタブでは初回表示時に選んだランダム5件を表示し続ける", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5)
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo
    const articles = Array.from({ length: 8 }, (_, index) => ({
      id: `article-${index}`,
      title: `記事${index}`,
    }))

    render(<Home articles={articles} />)

    fireEvent.click(screen.getByRole("tab", { name: "おすすめ" }))

    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:5 variant:divided")
    expect(Math.random).toHaveBeenCalledTimes(7)
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 })

    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))
    fireEvent.click(screen.getByRole("tab", { name: "おすすめ" }))

    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:5 variant:divided")
    expect(Math.random).toHaveBeenCalledTimes(7)
    expect(scrollTo).toHaveBeenCalledTimes(3)
  })

  it("タブを切り替えた時点でホームの表示状態を履歴へ保存する", async () => {
    const { router } = await import("@inertiajs/react")
    router.remember.mockClear()

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    fireEvent.click(screen.getByRole("tab", { name: "書き出し" }))
    fireEvent.click(screen.getByRole("tab", { name: "フィード" }))

    expect(router.remember).toHaveBeenLastCalledWith(
      { mode: "feed", recommendedArticleIds: ["article-1"], version: 1 },
      "home-state",
    )
  })

  it("履歴から戻ったホームでも直前に選んだタブを復元する", () => {
    const screenOne = render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    fireEvent.click(screen.getByRole("tab", { name: "おすすめ" }))
    screenOne.unmount()
    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    expect(screen.getByRole("tab", { name: "おすすめ" })).toHaveAttribute("aria-selected", "true")
  })

  it("削除済みタブの履歴状態はフィードへフォールバックする", () => {
    rememberedStates.set("home-state", {
      mode: "retired-tab",
      recommendedArticleIds: ["article-1"],
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
      recommendedArticleIds: ["article-1"],
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
      recommendedArticleIds: ["article-1"],
      version: 1,
    })
    requestHomeFeed()
    const home = render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    home.unmount() // 記事ページへ遷移
    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />) // 戻る

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
  })

  it("記事リストの横スワイプで表示モードを切り替える", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5)
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo
    const articles = Array.from({ length: 8 }, (_, index) => ({
      id: `article-${index}`,
      title: `記事${index}`,
    }))

    render(<Home articles={articles} />)

    const swipeArea = screen.getByTestId("home-articles-swipe-area")

    fireEvent.pointerDown(swipeArea, { clientX: 180, clientY: 40 })
    fireEvent.pointerUp(swipeArea, { clientX: 100, clientY: 55 })

    expect(screen.getByRole("tab", { name: "おすすめ" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:5 variant:divided")
    expect(scrollTo).toHaveBeenCalledWith({ top: 0 })

    fireEvent.pointerDown(swipeArea, { clientX: 180, clientY: 40 })
    fireEvent.pointerUp(swipeArea, { clientX: 100, clientY: 50 })

    expect(screen.getByRole("tab", { name: "書き出し" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByTestId("sentence-feed")).toHaveTextContent("articles:8")

    fireEvent.pointerDown(swipeArea, { clientX: 100, clientY: 40 })
    fireEvent.pointerUp(swipeArea, { clientX: 170, clientY: 50 })

    expect(screen.getByRole("tab", { name: "おすすめ" })).toHaveAttribute("aria-selected", "true")

    fireEvent.pointerDown(swipeArea, { clientX: 100, clientY: 40 })
    fireEvent.pointerUp(swipeArea, { clientX: 170, clientY: 50 })

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByTestId("articles-list")).toHaveTextContent("articles:8 variant:divided")
    expect(scrollTo).toHaveBeenCalledTimes(4)
  })

  it("縦移動が大きいスワイプでは表示モードを切り替えない", () => {
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo

    render(<Home articles={[{ id: "article-1", title: "記事1" }]} />)

    const swipeArea = screen.getByTestId("home-articles-swipe-area")

    fireEvent.pointerDown(swipeArea, { clientX: 180, clientY: 40 })
    fireEvent.pointerUp(swipeArea, { clientX: 120, clientY: 100 })

    expect(screen.getByRole("tab", { name: "フィード" })).toHaveAttribute("aria-selected", "true")
    expect(scrollTo).not.toHaveBeenCalled()
  })
})
