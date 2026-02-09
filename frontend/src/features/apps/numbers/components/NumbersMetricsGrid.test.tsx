import { render, screen } from "@testing-library/react"
import NumbersMetricsGrid from "./NumbersMetricsGrid"
import type { MetricBlock } from "@/features/apps/numbers/model/metrics"

const blocks: MetricBlock[] = [
  {
    label: "公開からの日数",
    value: "10 日",
  },
  {
    label: "ブログ",
    value: null,
    children: [
      {
        label: "総記事数",
        value: "3 本",
        children: [
          { label: "増田の総記事数", value: "2 本" },
          { label: "その他の総記事数", value: "1 本" },
        ],
      },
      {
        label: "総文字数",
        value: "1,234 字",
        children: [
          { label: "増田の総文字数", value: "900 字" },
          { label: "その他の総文字数", value: "334 字" },
        ],
      },
    ],
  },
]

describe("NumbersMetricsGrid", () => {
  it("単一ブロックと階層ブロックを描画する", () => {
    render(<NumbersMetricsGrid blocks={blocks} />)

    expect(screen.getByText("公開からの日数")).toBeInTheDocument()
    expect(screen.getByText("10 日")).toBeInTheDocument()

    expect(screen.getByText("ブログ")).toBeInTheDocument()
    expect(screen.getByText("総記事数")).toBeInTheDocument()
    expect(screen.getByText("3 本")).toBeInTheDocument()
    expect(screen.getByText("増田の総記事数")).toBeInTheDocument()
    expect(screen.getByText("2 本")).toBeInTheDocument()
    expect(screen.getByText("その他の総記事数")).toBeInTheDocument()
    expect(screen.getByText("1 本")).toBeInTheDocument()

    expect(screen.getByText("総文字数")).toBeInTheDocument()
    expect(screen.getByText("1,234 字")).toBeInTheDocument()
    expect(screen.getByText("増田の総文字数")).toBeInTheDocument()
    expect(screen.getByText("900 字")).toBeInTheDocument()
    expect(screen.getByText("その他の総文字数")).toBeInTheDocument()
    expect(screen.getByText("334 字")).toBeInTheDocument()
  })
})
