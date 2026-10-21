import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import BookshelfApp from "./BookshelfApp"

vi.mock("../shared/AppsDialogLauncher", () => ({
  default: ({ children, onOpen, onClose }) => (
    <>
      <button onClick={onOpen}>起動</button>
      <button onClick={onClose}>終了</button>
      {children}
    </>
  ),
}))

const book = {
  isbn: "9784101010014",
  title: "長い本の書名 ABC 123",
  author: "著者 共同著者",
  amazonUrl: "https://www.amazon.co.jp/dp/4101010013",
  articles: [{ id: "article", title: "登場記事のタイトル" }],
}
const json = (data) => Promise.resolve({ ok: true, json: async () => data })

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe("Bookshelf", () => {
  it("shows full details, normal article links and caches cover lookups only for this launch", async () => {
    fetch.mockImplementation((url) =>
      json(url.endsWith("/cover") ? { cover: null } : { books: [book], partial: false }),
    )
    render(<BookshelfApp />)
    fireEvent.click(screen.getByText("起動"))
    const spine = await screen.findByRole("button", { name: `${book.title} / ${book.author}` })
    expect(fetch).toHaveBeenCalledTimes(1)
    fireEvent.click(spine)
    expect(await screen.findByRole("heading", { name: book.title })).toBeVisible()
    expect(screen.getByRole("link", { name: "登場記事のタイトル" })).toHaveAttribute("href", "/articles/article")
    expect(screen.getByRole("link", { name: "Amazonでこの版を見る" })).toHaveAttribute("href", book.amazonUrl)
    fireEvent.click(screen.getByText("棚に戻る"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    fireEvent.click(spine)
    expect(fetch).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByText("棚に戻る"))
    fireEvent.click(screen.getByText("終了"))
    fireEvent.click(screen.getByText("起動"))
    fireEvent.click(await screen.findByRole("button", { name: `${book.title} / ${book.author}` }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4))
  })

  it.each([
    ["鈴木,俊貴,1983-", "鈴木 俊貴"],
    ["Camus,Albert,1913-1960 / 著者, 1900-", "Camus Albert 著者"],
    ["著者名 / 共同著者", "著者名 共同著者"],
    ["水野／太貴", "水野 太貴"],
    ["我孫子,武丸,1962-", "我孫子 武丸"],
    ["著者,1983年版", "著者,1983年版"],
  ])("formats author names and recognizable life dates in %s", async (author, expected) => {
    fetch.mockImplementation((url) => json(url.endsWith("/cover") ? { cover: null } : { books: [{ ...book, author }] }))
    render(<BookshelfApp />)
    fireEvent.click(screen.getByText("起動"))
    const spine = await screen.findByRole("button", { name: `${book.title} / ${expected}` })
    expect(spine).toHaveTextContent(book.title)
    expect(spine).not.toHaveTextContent(expected)
    fireEvent.click(spine)
    expect(await screen.findByText(expected)).toBeVisible()
  })

  it("distinguishes empty and failed results and retries on request", async () => {
    fetch.mockRejectedValueOnce(new Error("offline")).mockImplementation(() => json({ books: [] }))
    render(<BookshelfApp />)
    fireEvent.click(screen.getByText("起動"))
    expect(await screen.findByText("読み込めませんでした")).toBeVisible()
    expect(screen.queryByText("表示できる本はまだありません")).not.toBeInTheDocument()
    fireEvent.click(screen.getByText("再試行"))
    expect(await screen.findByText("表示できる本はまだありません")).toBeVisible()
  })

  it("keeps article links available while the cover is pending and after an image error", async () => {
    let resolveCover
    fetch.mockImplementation((url) =>
      url.endsWith("/cover")
        ? new Promise((resolve) => {
            resolveCover = resolve
          })
        : json({ books: [book] }),
    )
    render(<BookshelfApp />)
    fireEvent.click(screen.getByText("起動"))
    fireEvent.click(await screen.findByRole("button", { name: `${book.title} / ${book.author}` }))
    expect(screen.getByRole("link", { name: "登場記事のタイトル" })).toBeVisible()
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    await act(async () =>
      resolveCover(
        await json({
          cover: {
            imageUrl: "https://books.google.com/cover",
            googleBooksUrl: "https://books.google.com/books?id=test",
            removalContactUrl: "https://example.com/contact",
          },
        }),
      ),
    )
    const image = await screen.findByRole("img", { name: `${book.title}の表紙` })
    expect(screen.getByRole("link", { name: "Google Booksでこの本を見る" })).toHaveAttribute(
      "href",
      "https://books.google.com/books?id=test",
    )
    fireEvent.error(image)
    expect(screen.queryByRole("img", { name: `${book.title}の表紙` })).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "登場記事のタイトル" })).toBeVisible()
  })
  it("stops further cover requests after rate limiting until the next launch", async () => {
    const second = { ...book, isbn: "9780804429573", title: "別の本" }
    fetch.mockImplementation((url) =>
      url.endsWith("/cover") ? Promise.resolve({ ok: false, status: 503 }) : json({ books: [book, second] }),
    )
    render(<BookshelfApp />)
    fireEvent.click(screen.getByText("起動"))
    fireEvent.click(await screen.findByRole("button", { name: `${book.title} / ${book.author}` }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    fireEvent.click(screen.getByText("棚に戻る"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole("button", { name: `${second.title} / ${second.author}` }))
    expect(await screen.findByRole("heading", { name: second.title })).toBeVisible()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
  it("serializes cover requests while changing books", async () => {
    const second = { ...book, isbn: "9780804429573", title: "別の本" }
    let finishFirst
    fetch.mockImplementation((url) => {
      if (!url.endsWith("/cover")) return json({ books: [book, second] })
      if (url.includes(book.isbn))
        return new Promise((resolve) => {
          finishFirst = resolve
        })
      return json({ cover: null })
    })
    render(<BookshelfApp />)
    fireEvent.click(screen.getByText("起動"))
    fireEvent.click(await screen.findByRole("button", { name: `${book.title} / ${book.author}` }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    fireEvent.click(screen.getByText("棚に戻る"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole("button", { name: `${second.title} / ${second.author}` }))
    expect(fetch).toHaveBeenCalledTimes(2)
    await act(async () => finishFirst(await json({ cover: null })))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3))
    expect(screen.getByRole("heading", { name: second.title })).toBeVisible()
  })

  it("aborts a pending catalog request when leaving the page", async () => {
    let finishCatalog
    fetch.mockImplementation(() => new Promise((resolve) => (finishCatalog = resolve)))
    const { unmount } = render(<BookshelfApp />)
    fireEvent.click(screen.getByText("起動"))
    const signal = fetch.mock.calls[0][1].signal
    expect(signal.aborted).toBe(false)

    unmount()
    await act(async () => finishCatalog(await json({ books: [book] })))

    expect(signal.aborted).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it("aborts the active cover request and never starts queued covers after leaving the page", async () => {
    const second = { ...book, isbn: "9780804429573", title: "別の本" }
    let finishCover
    fetch.mockImplementation((url) =>
      url.endsWith("/cover") ? new Promise((resolve) => (finishCover = resolve)) : json({ books: [book, second] }),
    )
    const { unmount } = render(<BookshelfApp />)
    fireEvent.click(screen.getByText("起動"))
    fireEvent.click(await screen.findByRole("button", { name: `${book.title} / ${book.author}` }))
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    const signal = fetch.mock.calls[1][1].signal
    expect(signal.aborted).toBe(false)
    fireEvent.click(screen.getByText("棚に戻る"))
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    fireEvent.click(screen.getByRole("button", { name: `${second.title} / ${second.author}` }))
    expect(await screen.findByRole("heading", { name: second.title })).toBeVisible()
    expect(fetch).toHaveBeenCalledTimes(2)

    unmount()
    await act(async () => finishCover(await json({ cover: null })))

    expect.soft(signal.aborted).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
