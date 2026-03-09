import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ContentCard from "./ContentCard"

describe("ContentCard", () => {
  it("子要素を描画する", () => {
    render(
      <ContentCard>
        <div>カード内容</div>
      </ContentCard>,
    )

    expect(screen.getByText("カード内容")).toBeInTheDocument()
  })
})
