import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticlesList from "./ArticlesList"

vi.mock("./ArticleCard", () => ({
  default: ({ article, presentation, sx }) => (
    <div data-testid={`article-${article.id}`} style={{ paddingBottom: sx?.pb }}>
      {article.title}:{presentation ?? "card"}
    </div>
  ),
}))

describe("ArticlesList", () => {
  it("記事がなければ空状態を表示する", () => {
    render(<ArticlesList articles={[]} />)

    expect(screen.getByText("記事がありません。")).toBeInTheDocument()
  })

  it("emptyMessage があればそちらを表示する", () => {
    render(<ArticlesList articles={[]} emptyMessage="条件に一致する記事がありません。" />)

    expect(screen.getByText("条件に一致する記事がありません。")).toBeInTheDocument()
  })

  it("記事一覧を描画する", () => {
    render(
      <ArticlesList
        articles={[
          { id: "a1", title: "記事1" },
          { id: "a2", title: "記事2" },
        ]}
      />,
    )

    expect(screen.getByText("記事1:card")).toBeInTheDocument()
    expect(screen.getByText("記事2:card")).toBeInTheDocument()
  })

  it("区切り線型の記事一覧を描画する", () => {
    render(
      <ArticlesList
        variant="divided"
        articles={[
          { id: "a1", title: "記事1" },
          { id: "a2", title: "記事2" },
        ]}
      />,
    )

    expect(screen.getByText("記事1:plain")).toBeInTheDocument()
    expect(screen.getByText("記事2:plain")).toBeInTheDocument()
    expect(screen.getByTestId("article-a1")).toHaveStyle({ paddingBottom: "2.5px" })
    expect(screen.getByTestId("article-a2")).toHaveStyle({ paddingBottom: "0px" })
  })
})
