import { render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import LoadMoreArticles from "./LoadMoreArticles"

it("読み込み中もボタンを保持し、完了後のキーボードフォーカスを失わない", () => {
  const props = { hasMore: true, loadMore: vi.fn(), buffer: 400 }
  const { rerender } = render(<LoadMoreArticles {...props} />)
  const button = screen.getByRole("button", { name: "さらに読み込む" })
  button.focus()
  rerender(<LoadMoreArticles {...props} loading />)
  expect(screen.getByRole("button", { name: "さらに読み込む" })).toBe(button)
  expect(button).toBeDisabled()
  rerender(<LoadMoreArticles {...props} />)
  expect(button).toBeEnabled()
  expect(button).toHaveFocus()
})
