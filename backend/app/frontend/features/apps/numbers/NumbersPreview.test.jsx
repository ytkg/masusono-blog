import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import NumbersPreview from "./NumbersPreview"

vi.mock("./NumbersMetricsGrid", () => ({
  default: ({ blocks }) => <div data-testid="numbers-grid">{blocks.length} blocks</div>,
}))

describe("NumbersPreview", () => {
  it("空配列で読み込み中ならメッセージを出す", () => {
    render(<NumbersPreview metrics={null} isLoading hasError={false} />)

    expect(screen.getByText("読み込み中...")).toBeInTheDocument()
  })

  it("エラー時は失敗文言を出す", () => {
    render(<NumbersPreview metrics={null} isLoading={false} hasError />)

    expect(screen.getByText("データの取得に失敗しました。")).toBeInTheDocument()
  })

  it("データがあればグリッドを表示する", () => {
    render(<NumbersPreview metrics={{ blocks: [{ label: "記事数" }] }} isLoading={false} hasError={false} />)

    expect(screen.getByTestId("numbers-grid")).toHaveTextContent("1 blocks")
  })
})
