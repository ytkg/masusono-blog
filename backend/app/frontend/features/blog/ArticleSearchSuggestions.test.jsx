import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleSearchSuggestions from "./ArticleSearchSuggestions"

describe("ArticleSearchSuggestions", () => {
  it("著者とタグを重複なく検索候補にする", () => {
    const onSelect = vi.fn()

    render(
      <ArticleSearchSuggestions
        articles={[
          { author: " 増田 ", tags: "Ruby, Rails" },
          { author: "増田", tags: "Rails, JavaScript" },
          { author: "", tags: "" },
        ]}
        onSelect={onSelect}
      />,
    )

    expect(screen.getByText("著者から探す")).toBeInTheDocument()
    expect(screen.getAllByText("@増田")).toHaveLength(1)
    expect(screen.getAllByText("#Rails")).toHaveLength(1)

    fireEvent.click(screen.getByText("#JavaScript"))

    expect(onSelect).toHaveBeenCalledWith("#JavaScript")
  })

  it("記事がなくても読了目安の候補を表示する", () => {
    render(<ArticleSearchSuggestions articles={[]} onSelect={vi.fn()} />)

    expect(screen.queryByText("著者から探す")).not.toBeInTheDocument()
    expect(screen.queryByText("タグから探す")).not.toBeInTheDocument()
    expect(screen.getByText("読了目安から探す")).toBeInTheDocument()
    expect(screen.getByText("5分~")).toBeInTheDocument()
  })
})
