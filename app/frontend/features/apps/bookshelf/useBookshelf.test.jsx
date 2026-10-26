import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import useBookshelf from "./useBookshelf"

const book = { isbn: "9784101010014", title: "本", author: "著者", articles: [] }
const second = { ...book, isbn: "9780804429573", title: "別の本" }
const json = (data) => ({ ok: true, json: async () => data })

beforeEach(() => vi.stubGlobal("fetch", vi.fn()))
afterEach(() => vi.unstubAllGlobals())

it.each(["success", "failure"])("ignores a late catalog %s after opening a new session", async (outcome) => {
  const old = Promise.withResolvers()
  fetch.mockReturnValueOnce(old.promise).mockResolvedValueOnce(json({ books: [second] }))
  const { result } = renderHook(useBookshelf)
  let opening
  act(() => {
    opening = result.current.open()
  })
  const signal = fetch.mock.calls[0][1].signal
  act(() => result.current.close())
  await act(async () => result.current.open())
  expect(signal.aborted).toBe(true)
  await act(async () => {
    if (outcome === "success") old.resolve(json({ books: [book] }))
    else old.reject(new Error("late failure"))
    await opening
  })
  expect(result.current.state).toEqual({ books: [second], loading: false, error: false })
})

it("serializes selections and never displays a previous book's late cover", async () => {
  const firstCover = Promise.withResolvers()
  const secondCover = Promise.withResolvers()
  fetch
    .mockResolvedValueOnce(json({ books: [book, second] }))
    .mockReturnValueOnce(firstCover.promise)
    .mockReturnValueOnce(secondCover.promise)
  const { result } = renderHook(useBookshelf)
  await act(async () => result.current.open())
  let firstSelection
  let secondSelection
  await act(async () => {
    firstSelection = result.current.select(book)
  })
  act(() => {
    secondSelection = result.current.select(second)
  })
  expect(fetch).toHaveBeenCalledTimes(2)
  await act(async () => {
    firstCover.resolve(json({ cover: { imageUrl: "old-cover" } }))
    await firstSelection
  })
  expect(result.current.selected).toEqual(second)
  expect(result.current.cover).toBeNull()
  expect(fetch).toHaveBeenCalledTimes(3)
  await act(async () => {
    secondCover.resolve(json({ cover: { imageUrl: "current-cover" } }))
    await secondSelection
  })
  expect(result.current.cover).toEqual({ imageUrl: "current-cover" })
})

it("discards the old cover queue and its late rate limit when reopening", async () => {
  const oldCover = Promise.withResolvers()
  fetch.mockImplementation((url) =>
    Promise.resolve(json(url.endsWith("/cover") ? { cover: { imageUrl: url } } : { books: [book, second] })),
  )
  const { result } = renderHook(useBookshelf)
  await act(async () => result.current.open())
  fetch.mockReturnValueOnce(oldCover.promise)
  let oldSelection
  let queuedSelection
  await act(async () => {
    oldSelection = result.current.select(book)
  })
  const signal = fetch.mock.calls[1][1].signal
  act(() => {
    queuedSelection = result.current.select(second)
  })
  act(() => result.current.close())
  await act(async () => result.current.open())
  expect(signal.aborted).toBe(true)
  await act(async () => {
    void result.current.select(second)
  })
  expect(fetch).toHaveBeenCalledTimes(4)
  expect(result.current.cover).toEqual({ imageUrl: `/api/app/bookshelf/${second.isbn}/cover` })
  await act(async () => {
    oldCover.resolve({ ok: false, status: 503 })
    await Promise.all([oldSelection, queuedSelection])
  })
  // The old queue must neither start another request nor overwrite the current cover.
  expect(fetch).toHaveBeenCalledTimes(4)
  expect(result.current.cover).toEqual({ imageUrl: `/api/app/bookshelf/${second.isbn}/cover` })
  await act(async () => result.current.select(book))
  expect(fetch).toHaveBeenCalledTimes(5)
  expect(result.current.cover).toEqual({ imageUrl: `/api/app/bookshelf/${book.isbn}/cover` })
})
