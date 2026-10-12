import { fireEvent, render as testingLibraryRender, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import NumbersTrendChart from "./NumbersTrendChart"
import { ThemeProvider } from "@mui/material/styles"
import theme from "../../../theme"

const render = (ui) => testingLibraryRender(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)

const trend = {
  title: "推移",
  description: "各指標の累積値を日ごとに表示しています。",
  series: [
    { key: "totalArticles", label: "総記事数", unit: "本", finalValue: "4 本" },
    { key: "totalChars", label: "総文字数", unit: "字", finalValue: "12 字" },
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
    expect(
      screen.getByText("カーソルを合わせるか、指で触れると数値を表示します。総文字数は1/300で表示しています。"),
    ).toBeInTheDocument()
    expect(screen.getByText("'25/10/05")).toBeInTheDocument()
    expect(screen.getByText("'25/10/06")).toBeInTheDocument()
    expect(screen.getByText("'25/10/07")).toBeInTheDocument()
    expect(screen.getByText("'25/10/08")).toBeInTheDocument()
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
    expect(screen.queryByText("本", { exact: true })).not.toBeInTheDocument()
    expect(screen.getAllByTestId("trend-date-grid-line")).toHaveLength(4)
  })

  it("総記事数と総文字数を描画する", () => {
    render(<NumbersTrendChart trend={trend} />)

    expect(screen.getByTestId("trend-line-totalArticles")).toHaveAttribute("d", expect.stringMatching(/^M 2 /))
    expect(screen.getByTestId("trend-line-totalChars")).toHaveAttribute("d", expect.stringMatching(/182\.34$/))
    expect(screen.queryByTestId("trend-line-masudaRunTotalPlays")).not.toBeInTheDocument()
  })

  it("表示幅に応じたカーソル位置の日付と実数を表示し、離すと閉じる", () => {
    render(<NumbersTrendChart trend={trend} />)
    const chart = screen.getByRole("img")
    chart.getBoundingClientRect = () => ({ left: 100, width: 720 })

    fireEvent(chart, new MouseEvent("pointermove", { bubbles: true, clientX: 580 }))
    expect(screen.getByRole("status")).toHaveTextContent("2025/10/07")
    expect(screen.getByRole("status")).toHaveTextContent("総記事数3 本")
    expect(screen.getByRole("status")).toHaveTextContent("総文字数8 字")
    expect(screen.getByTestId("trend-selected-date")).toBeInTheDocument()

    fireEvent(chart, Object.assign(new MouseEvent("pointerout", { bubbles: true }), { pointerType: "mouse" }))
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("タッチで選択してなぞり、離した後も値を読める", () => {
    render(<NumbersTrendChart trend={trend} />)
    const chart = screen.getByRole("img")
    chart.getBoundingClientRect = () => ({ left: 0, width: 360 })
    chart.setPointerCapture = vi.fn()
    const touch = (type, clientX) =>
      Object.assign(new MouseEvent(type, { bubbles: true, clientX }), { pointerType: "touch", pointerId: 7 })

    fireEvent(chart, touch("pointerdown", 0))
    expect(screen.getByRole("status")).toHaveTextContent("2025/10/05")
    expect(chart.setPointerCapture).toHaveBeenCalledWith(7)
    fireEvent(chart, touch("pointermove", 360))
    fireEvent(chart, touch("pointerup", 360))
    fireEvent(chart, touch("pointerout", 360))
    expect(screen.getByRole("status")).toHaveTextContent("2025/10/08")
    fireEvent(chart, touch("pointercancel", 360))
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("キーボードで日付を選択でき、文字数は縮尺を戻した実数で表示する", () => {
    render(
      <NumbersTrendChart
        trend={{ ...trend, points: [{ date: "2025-10-05", totalArticles: 1000, totalChars: 600000 }, trend.points[3]] }}
      />,
    )
    const chart = screen.getByRole("img")
    fireEvent.keyDown(chart, { key: "Home" })
    expect(within(screen.getByRole("status")).getByText("600,000 字")).toBeInTheDocument()
    expect(within(screen.getByRole("status")).getByText("1,000 本")).toBeInTheDocument()
    fireEvent.keyDown(chart, { key: "ArrowRight" })
    expect(screen.getByRole("status")).toHaveTextContent("2025/10/08")
    fireEvent.keyDown(chart, { key: "ArrowLeft" })
    expect(screen.getByRole("status")).toHaveTextContent("2025-10-05")
    fireEvent.keyDown(chart, { key: "End" })
    expect(screen.getByRole("status")).toHaveTextContent("2025/10/08")
    fireEvent.keyDown(chart, { key: "Escape" })
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("推移データがなければ何も表示しない", () => {
    const { container } = render(<NumbersTrendChart trend={{ series: [], points: [] }} />)

    expect(container).toBeEmptyDOMElement()
  })
  it("1点だけの推移を日付ラベル1つで表示する", () => {
    render(<NumbersTrendChart trend={{ ...trend, points: [trend.points[0]] }} />)
    expect(screen.getByText("'25/10/05")).toBeInTheDocument()
    expect(screen.getAllByTestId("trend-date-grid-line")).toHaveLength(1)
    expect(screen.getByTestId("trend-line-totalArticles")).toHaveAttribute("d", "M 2 18")
    fireEvent.keyDown(screen.getByRole("img"), { key: "Home" })
    expect(screen.getByRole("status")).toHaveTextContent("1 本")
    expect(screen.getByRole("status")).toHaveTextContent("3 字")
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
