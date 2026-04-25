import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleFilters from "./ArticleFilters"

function renderArticleFilters(onAuthorChange) {
  const onYearMonthChange = vi.fn()

  render(
    <ArticleFilters
      author="増田"
      yearMonth="all"
      authorOptions={[
        { name: "増田", count: 1 },
        { name: "その他1", count: 2 },
      ]}
      yearMonthOptions={[
        { yearMonth: "2025/10", count: 1 },
        { yearMonth: "2025/09", count: 2 },
      ]}
      authorTotalCount={3}
      yearMonthTotalCount={1}
      onAuthorChange={onAuthorChange}
      onYearMonthChange={onYearMonthChange}
    />,
  )

  return { onYearMonthChange }
}

function stubScrollTo() {
  const scrollTo = vi.fn()

  Object.defineProperty(window, "scrollTo", {
    value: scrollTo,
    writable: true,
    configurable: true,
  })

  return scrollTo
}

describe("ArticleFilters", () => {
  it("右下ボタンからモーダルを開き、著者選択で変更を反映する", () => {
    const onAuthorChange = vi.fn()
    const scrollTo = stubScrollTo()

    renderArticleFilters(onAuthorChange)

    fireEvent.click(screen.getByRole("button", { name: "絞り込みを開く" }))

    expect(screen.getByRole("dialog", { name: "絞り込み" })).toBeInTheDocument()
    expect(screen.queryByText("3件中1件を表示")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "クリア" })).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "著者: すべて (3)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "年月: すべて (1)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "増田 (1)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "その他1 (2)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "2025/10 (1)" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "2025/09 (2)" })).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "その他1 (2)" }))

    expect(onAuthorChange).toHaveBeenNthCalledWith(1, "その他1")
    expect(scrollTo).toHaveBeenNthCalledWith(1, { top: 0, behavior: "smooth" })
    expect(screen.getByRole("dialog", { name: "絞り込み" })).toBeInTheDocument()
  })

  it("すべてを選ぶと all を渡し、モーダルは開いたまま", () => {
    const onAuthorChange = vi.fn()
    const scrollTo = stubScrollTo()

    renderArticleFilters(onAuthorChange)

    fireEvent.click(screen.getByRole("button", { name: "絞り込みを開く" }))
    fireEvent.click(screen.getByRole("button", { name: "著者: すべて (3)" }))

    expect(onAuthorChange).toHaveBeenCalledWith("all")
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })
    expect(screen.getByRole("dialog", { name: "絞り込み" })).toBeInTheDocument()
  })

  it("年月を選ぶと onYearMonthChange を呼び、モーダルは開いたまま", () => {
    const onAuthorChange = vi.fn()
    const scrollTo = stubScrollTo()
    const { onYearMonthChange } = renderArticleFilters(onAuthorChange)

    fireEvent.click(screen.getByRole("button", { name: "絞り込みを開く" }))
    fireEvent.click(screen.getByRole("button", { name: "2025/09 (2)" }))

    expect(onYearMonthChange).toHaveBeenCalledWith("2025/09")
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" })
    expect(screen.getByRole("dialog", { name: "絞り込み" })).toBeInTheDocument()
  })

  it("0件のラベルは表示したまま選択不可にする", () => {
    const onAuthorChange = vi.fn()
    const onYearMonthChange = vi.fn()

    render(
      <ArticleFilters
        author="all"
        yearMonth="2025/08"
        authorOptions={[
          { name: "増田", count: 0 },
          { name: "その他1", count: 0 },
          { name: "あいう", count: 1 },
        ]}
        yearMonthOptions={[
          { yearMonth: "2025/10", count: 2 },
          { yearMonth: "2025/09", count: 1 },
          { yearMonth: "2025/08", count: 0 },
        ]}
        authorTotalCount={1}
        yearMonthTotalCount={4}
        onAuthorChange={onAuthorChange}
        onYearMonthChange={onYearMonthChange}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "絞り込みを開く" }))

    expect(screen.getByText("増田 (0)").closest(".MuiChip-root")).toHaveClass("Mui-disabled")
    expect(screen.getByText("その他1 (0)").closest(".MuiChip-root")).toHaveClass("Mui-disabled")
    expect(screen.getByRole("button", { name: "あいう (1)" })).not.toBeDisabled()
    expect(screen.getByText("2025/08 (0)").closest(".MuiChip-root")).toHaveClass("Mui-disabled")

    fireEvent.click(screen.getByText("増田 (0)"))
    fireEvent.click(screen.getByText("2025/08 (0)"))

    expect(onAuthorChange).not.toHaveBeenCalled()
    expect(onYearMonthChange).not.toHaveBeenCalled()
  })
})
