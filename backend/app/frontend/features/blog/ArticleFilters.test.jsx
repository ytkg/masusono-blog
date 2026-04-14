import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleFilters from "./ArticleFilters"

describe("ArticleFilters", () => {
  it("右下ボタンからモーダルを開き、著者選択で閉じる", async () => {
    const onAuthorChange = vi.fn()
    const scrollTo = vi.fn()

    Object.defineProperty(window, "scrollTo", {
      value: scrollTo,
      writable: true,
      configurable: true,
    })

    render(
      <ArticleFilters
        author="増田"
        authorOptions={[
          { name: "増田", count: 1 },
          { name: "その他1", count: 2 },
        ]}
        totalCount={3}
        onAuthorChange={onAuthorChange}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "絞り込みを開く" }))

    expect(screen.getByRole("dialog", { name: "絞り込み" })).toBeInTheDocument()
    expect(screen.queryByText("3件中1件を表示")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "クリア" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "すべて (3)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "増田 (1)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "その他1 (2)" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "その他1 (2)" }))

    expect(onAuthorChange).toHaveBeenNthCalledWith(1, "その他1")
    expect(scrollTo).toHaveBeenNthCalledWith(1, { top: 0, behavior: "smooth" })
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "絞り込み" })).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "絞り込みを開く" }))
    fireEvent.click(screen.getByRole("button", { name: "すべて (3)" }))

    expect(onAuthorChange).toHaveBeenNthCalledWith(2, "all")
    expect(scrollTo).toHaveBeenNthCalledWith(2, { top: 0, behavior: "smooth" })
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "絞り込み" })).not.toBeInTheDocument()
    })
  })
})
