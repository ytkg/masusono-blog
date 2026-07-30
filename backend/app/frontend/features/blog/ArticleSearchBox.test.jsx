import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleSearchBox from "./ArticleSearchBox"

describe("ArticleSearchBox", () => {
  it("入力値の変更を通知する", () => {
    const onChange = vi.fn()

    render(<ArticleSearchBox query="" onChange={onChange} onClear={vi.fn()} />)

    fireEvent.change(screen.getByRole("textbox", { name: "記事を検索" }), { target: { value: "Ruby" } })

    expect(onChange).toHaveBeenCalledWith("Ruby")
    expect(screen.queryByRole("button", { name: "検索語をクリア" })).not.toBeInTheDocument()
  })

  it("検索語がある場合はクリア操作を表示する", () => {
    const onClear = vi.fn()

    render(<ArticleSearchBox query="Ruby" onChange={vi.fn()} onClear={onClear} />)

    fireEvent.click(screen.getByRole("button", { name: "検索語をクリア" }))

    expect(onClear).toHaveBeenCalledOnce()
  })
})
