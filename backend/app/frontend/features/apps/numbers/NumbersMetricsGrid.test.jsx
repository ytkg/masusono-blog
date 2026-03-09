import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import NumbersMetricsGrid from "./NumbersMetricsGrid"

describe("NumbersMetricsGrid", () => {
  it("ネストした metrics をフラットに描画する", () => {
    render(
      <NumbersMetricsGrid
        blocks={[
          {
            label: "ブログ",
            value: null,
            children: [
              { label: "記事数", value: "2 本" },
              {
                label: "文字数",
                value: "100 字",
                children: [{ label: "平均", value: "50 字" }],
              },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText("ブログ")).toBeInTheDocument()
    expect(screen.getByText("記事数")).toBeInTheDocument()
    expect(screen.getByText("2 本")).toBeInTheDocument()
    expect(screen.getByText("文字数")).toBeInTheDocument()
    expect(screen.getByText("100 字")).toBeInTheDocument()
    expect(screen.getByText("平均")).toBeInTheDocument()
    expect(screen.getByText("50 字")).toBeInTheDocument()
  })

  it("値がない block はダッシュを表示する", () => {
    render(<NumbersMetricsGrid blocks={[{ label: "ポッドキャスト", value: null }]} />)

    expect(screen.getByText("—")).toBeInTheDocument()
  })
})
