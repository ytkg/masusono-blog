import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import NumbersPreview from "./NumbersPreview"

vi.mock("./NumbersMetricsGrid", () => ({
  default: ({ blocks }) => <div data-testid="numbers-grid">{blocks.length} blocks</div>,
}))

vi.mock("./NumbersTrendChart", () => ({
  default: ({ trend }) => (trend ? <div data-testid="numbers-trend">{trend.title}</div> : null),
}))

describe("NumbersPreview", () => {
  it("データがなければメッセージを出す", () => {
    render(<NumbersPreview metrics={null} />)

    expect(screen.getByText("データがありません。")).toBeInTheDocument()
  })

  it("データがあればグリッドを表示する", () => {
    render(<NumbersPreview metrics={{ blocks: [{ label: "記事数" }] }} />)

    expect(screen.getByTestId("numbers-grid")).toHaveTextContent("1 blocks")
  })

  it("推移データがあればグラフを表示する", () => {
    render(<NumbersPreview metrics={{ blocks: [{ label: "記事数" }], trend: { title: "推移" } }} />)

    expect(screen.getByTestId("numbers-grid").compareDocumentPosition(screen.getByTestId("numbers-trend"))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
    expect(screen.getByTestId("numbers-trend")).toHaveTextContent("推移")
  })
})
