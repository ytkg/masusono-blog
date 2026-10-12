import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import PageContainer from "./PageContainer"

describe("PageContainer", () => {
  it("指定 component と id を反映して子要素を描画する", () => {
    render(
      <PageContainer component="article" id="blog-page">
        <div>ページ本文</div>
      </PageContainer>,
    )

    const article = screen.getByText("ページ本文").closest("article")
    expect(article).toHaveAttribute("id", "blog-page")
  })
})
