import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import NumbersPreview from "./NumbersPreview"

vi.mock("./NumbersMetricsGrid", () => ({
  default: ({ blocks }) => <div data-testid="numbers-grid">{blocks.length} blocks</div>,
}))

describe("NumbersPreview", () => {
  it("空配列で読み込み中ならメッセージを出す", () => {
    render(<NumbersPreview metrics={null} isLoading hasError={false} error={null} />)

    expect(screen.getByText("読み込み中...")).toBeInTheDocument()
  })

  it("エラーコードに応じた文言を出す", () => {
    render(
      <NumbersPreview
        metrics={null}
        isLoading={false}
        hasError
        error={{ code: "upstream_timeout", message: "Upstream service request timed out." }}
      />,
    )

    expect(screen.getByText("応答が遅れています。少し待ってから再度お試しください。")).toBeInTheDocument()
  })

  it("データがあればグリッドを表示する", () => {
    render(
      <NumbersPreview metrics={{ blocks: [{ label: "記事数" }] }} isLoading={false} hasError={false} error={null} />,
    )

    expect(screen.getByTestId("numbers-grid")).toHaveTextContent("1 blocks")
  })
})
