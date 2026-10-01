import { render as testingLibraryRender, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import NumbersTrendChart from "./NumbersTrendChart"
import { ThemeProvider } from "@mui/material/styles"
import theme from "../../../theme"

const render = (ui) => testingLibraryRender(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)

const trend = {
  title: "推移",
  description: "各指標の累積値を日ごとに表示しています。",
  series: [
    { key: "totalArticles", label: "総記事数", finalValue: "4 本" },
    { key: "totalChars", label: "総文字数", finalValue: "12 字" },
  ],
  points: [
    { date: "2025-10-05", label: "2025/10/05", totalArticles: 1, totalChars: 3 },
    { date: "2025-10-06", label: "2025/10/06", totalArticles: 2, totalChars: 5 },
    { date: "2025-10-07", label: "2025/10/07", totalArticles: 3, totalChars: 8 },
    { date: "2025-10-08", label: "2025/10/08", totalArticles: 4, totalChars: 12 },
  ],
}

describe("NumbersTrendChart", () => {
  it("推移グラフと系列の最終値を表示する", () => {
    render(<NumbersTrendChart trend={trend} />)

    expect(screen.getByRole("heading", { name: "推移" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "総記事数、総文字数の累積推移" })).toBeInTheDocument()
    expect(screen.getByText("総記事数")).toBeInTheDocument()
    expect(screen.getByText("4 本")).toBeInTheDocument()
    expect(screen.getByText("総文字数")).toBeInTheDocument()
    expect(screen.getByText("12 字")).toBeInTheDocument()
    expect(screen.queryByText("増田RUN総プレイ回数")).not.toBeInTheDocument()
    expect(screen.getByText("総文字数は1/300で表示しています。")).toBeInTheDocument()
    expect(screen.getByText("'25/10/05")).toBeInTheDocument()
    expect(screen.getByText("'25/10/06")).toBeInTheDocument()
    expect(screen.getByText("'25/10/07")).toBeInTheDocument()
    expect(screen.getByText("'25/10/08")).toBeInTheDocument()
    expect(screen.getAllByTestId("trend-date-grid-line")).toHaveLength(4)
  })

  it("総記事数と総文字数を描画する", () => {
    render(<NumbersTrendChart trend={trend} />)

    expect(screen.getByTestId("trend-line-totalArticles")).toHaveAttribute("d", expect.stringMatching(/^M 18 /))
    expect(screen.getByTestId("trend-line-totalChars")).toHaveAttribute("d", expect.stringMatching(/182\.34$/))
    expect(screen.queryByTestId("trend-line-masudaRunTotalPlays")).not.toBeInTheDocument()
  })

  it("推移データがなければ何も表示しない", () => {
    const { container } = render(<NumbersTrendChart trend={{ series: [], points: [] }} />)

    expect(container).toBeEmptyDOMElement()
  })
  it("1点だけの推移を日付ラベル1つで表示する", () => {
    render(<NumbersTrendChart trend={{ ...trend, points: [trend.points[0]] }} />)
    expect(screen.getByText("'25/10/05")).toBeInTheDocument()
    expect(screen.getAllByTestId("trend-date-grid-line")).toHaveLength(1)
    expect(screen.getByTestId("trend-line-totalArticles")).toHaveAttribute("d", "M 18 18")
  })

  it("無効値とゼロだけの系列に壊れたSVGパスを生成しない", () => {
    render(
      <NumbersTrendChart
        trend={{
          ...trend,
          points: [
            { date: "2025-10-05", totalArticles: NaN, totalChars: Infinity },
            { date: "2025-10-06", totalArticles: 0, totalChars: 0 },
          ],
        }}
      />,
    )
    expect(screen.queryByTestId("trend-line-totalArticles")).not.toBeInTheDocument()
    expect(screen.queryByTestId("trend-line-totalChars")).not.toBeInTheDocument()
    expect(screen.getByText("総記事数")).toBeInTheDocument()
  })
})
