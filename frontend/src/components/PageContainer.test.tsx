import { render, screen } from "@testing-library/react"
import PageContainer from "./PageContainer"

describe("PageContainer", () => {
  it("デフォルトで section 要素として子要素を描画する", () => {
    render(
      <PageContainer>
        <span>content</span>
      </PageContainer>,
    )

    const section = screen.getByText("content").closest("section")
    expect(section).not.toBeNull()
  })

  it("component と id をカスタマイズできる", () => {
    render(
      <PageContainer component="article" id="page-about">
        <p>本文</p>
      </PageContainer>,
    )

    const article = screen.getByText("本文").closest("article")
    expect(article).toHaveAttribute("id", "page-about")
  })
})
