import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import FeatureLinkCard from "./FeatureLinkCard"

describe("FeatureLinkCard", () => {
  it("タイトル・説明とリンク先を表示する", () => {
    render(
      <MemoryRouter>
        <FeatureLinkCard title="ブログ" description="最新記事はこちら" to="/blog" />
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { level: 3, name: "ブログ" })).toBeInTheDocument()
    expect(screen.getByText("最新記事はこちら")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /ブログ/ })).toHaveAttribute("href", "/blog")
  })

  it("子要素を描画する", () => {
    render(
      <MemoryRouter>
        <FeatureLinkCard title="ポッドキャスト" description="毎週更新" to="/podcast">
          <span data-testid="child">extra</span>
        </FeatureLinkCard>
      </MemoryRouter>,
    )

    expect(screen.getByTestId("child")).toHaveTextContent("extra")
  })
})
