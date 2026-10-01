import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { router } from "@inertiajs/react"
import SentenceFeed from "./SentenceFeed"
import { APPEND_SENTENCE_COUNT, INITIAL_SENTENCE_COUNT, SENTENCE_REVEAL_SETTLE_MS } from "./sentenceFeedData"

const history = vi.hoisted(() => ({ state: null }))
vi.mock("@inertiajs/react", async () => {
  const React = await import("react")
  return {
    router: {
      remember: vi.fn((state) => {
        history.state = state
      }),
    },
    useRemember: (initial) => React.useState(() => history.state ?? initial),
    Link: React.forwardRef(function Link({ children, href, ...props }, ref) {
      return (
        <a href={href} ref={ref} {...props}>
          {children}
        </a>
      )
    }),
  }
})

const articles = [{ id: "first", content: "<p>最初の一文。次の文。</p>" }]
let observers
beforeEach(() => {
  vi.useFakeTimers()
  history.state = null
  vi.mocked(router.remember).mockClear()
  observers = []
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe = vi.fn()
      disconnect = vi.fn()
      constructor(callback) {
        this.callback = callback
        observers.push(this)
      }
    },
  )
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("SentenceFeed", () => {
  it("追加表示と表示済み状態を保存し、再表示時に復元する", () => {
    const view = render(<SentenceFeed articles={articles} />)
    expect(screen.getAllByRole("link")).toHaveLength(INITIAL_SENTENCE_COUNT)
    act(() => vi.advanceTimersByTime(SENTENCE_REVEAL_SETTLE_MS))
    expect(history.state.items.every((item) => item.hasRevealed)).toBe(true)
    fireEvent.scroll(window)
    fireEvent.scroll(window)
    act(() => vi.advanceTimersByTime(20))
    expect(screen.getAllByRole("link")).toHaveLength(INITIAL_SENTENCE_COUNT + APPEND_SENTENCE_COUNT)
    const keys = history.state.items.map((item) => item.key)
    view.unmount()
    render(<SentenceFeed articles={articles} />)
    expect(screen.getAllByRole("link")).toHaveLength(keys.length)
    expect(history.state.items.map((item) => item.key)).toEqual(keys)
  })

  it("アンマウントで予約済み追加・表示タイマー・計測を解除する", () => {
    const cancel = vi.spyOn(window, "cancelAnimationFrame")
    const view = render(<SentenceFeed articles={articles} />)
    fireEvent.scroll(window)
    view.unmount()
    act(() => vi.advanceTimersByTime(SENTENCE_REVEAL_SETTLE_MS))
    expect(router.remember).not.toHaveBeenCalled()
    expect(cancel).toHaveBeenCalledOnce()
    expect(observers[0].disconnect).toHaveBeenCalledOnce()
  })

  it("記事がなければ空状態を表示する", () => {
    render(<SentenceFeed articles={[]} />)
    expect(screen.getByText("書き出しを表示できる記事がありません。")).toBeInTheDocument()
    expect(screen.queryByRole("link")).not.toBeInTheDocument()
  })
})
