import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ArticleBody from "./ArticleBody"

describe("ArticleBody", () => {
  it("本文がない場合は案内を表示する", () => {
    render(<ArticleBody html="" hasBody={false} shouldCollapse={false} />)

    expect(screen.getByText("本文がありません。")).toBeInTheDocument()
  })

  it("長い本文は折りたたみ、操作で全文を表示する", () => {
    const html = `<p>${"あ".repeat(81)}</p>`

    render(<ArticleBody html={html} hasBody shouldCollapse />)

    expect(screen.getByText(`${"あ".repeat(80)}…`)).toBeInTheDocument()
    expect(screen.queryByTestId("article-body-html")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "続きを読む" }))

    expect(screen.getByTestId("article-body-html")).toHaveTextContent("あ".repeat(81))
    expect(screen.getByRole("button", { name: "閉じる" })).toBeInTheDocument()
  })

  it("折りたたみ対象でない本文をそのまま表示する", () => {
    render(<ArticleBody html="<p>短い本文</p>" hasBody shouldCollapse />)

    expect(screen.getByTestId("article-body-html")).toHaveTextContent("短い本文")
    expect(screen.queryByRole("button", { name: "続きを読む" })).not.toBeInTheDocument()
  })
})
