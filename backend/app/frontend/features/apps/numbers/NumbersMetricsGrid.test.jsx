import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import NumbersMetricsGrid from "./NumbersMetricsGrid"

describe("NumbersMetricsGrid", () => {
  it("セクション配下の metrics を主指標として描画する", () => {
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
    expect(screen.getByText("2 本")).toHaveStyle({ fontSize: "22px" })
    expect(screen.getByText("文字数")).toBeInTheDocument()
    expect(screen.getByText("100 字")).toHaveStyle({ fontSize: "22px" })
    expect(screen.getByText("平均")).toBeInTheDocument()
    expect(screen.getByText("50 字")).toHaveStyle({ fontSize: "17px" })
  })

  it("値を持つ指標の子要素は子指標として描画する", () => {
    render(
      <NumbersMetricsGrid
        blocks={[
          {
            label: "総記事数",
            value: "2 本",
            children: [{ label: "増田の総記事数", value: "1 本" }],
          },
        ]}
      />,
    )

    expect(screen.getByText("総記事数")).toBeInTheDocument()
    expect(screen.getByText("2 本")).toHaveStyle({ fontSize: "22px" })
    expect(screen.getByText("増田の総記事数")).toBeInTheDocument()
    expect(screen.getByText("1 本")).toHaveStyle({ fontSize: "17px" })
  })

  it("値がない block はダッシュを表示する", () => {
    render(<NumbersMetricsGrid blocks={[{ label: "増田RUN", value: null }]} />)

    expect(screen.getByText("—")).toBeInTheDocument()
  })
})
