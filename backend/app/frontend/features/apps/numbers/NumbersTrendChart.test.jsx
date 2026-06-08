import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import NumbersTrendChart from "./NumbersTrendChart"

const trend = {
  title: "推移",
  description: "各指標の累積値を日ごとに表示しています。",
  series: [
    { key: "totalArticles", label: "総記事数", finalValue: "4 本" },
    { key: "totalChars", label: "総文字数", finalValue: "12 字" },
    { key: "masudaRunTotalPlays", label: "増田RUN総プレイ回数", finalValue: "3 回" },
  ],
  points: [
    { date: "2025-10-05", label: "2025/10/05", totalArticles: 1, totalChars: 3, masudaRunTotalPlays: 0 },
    { date: "2025-10-06", label: "2025/10/06", totalArticles: 2, totalChars: 5, masudaRunTotalPlays: 2 },
    { date: "2025-10-07", label: "2025/10/07", totalArticles: 4, totalChars: 12, masudaRunTotalPlays: 3 },
  ],
}

describe("NumbersTrendChart", () => {
  it("推移グラフと系列の最終値を表示する", () => {
    render(<NumbersTrendChart trend={trend} />)

    expect(screen.getByRole("heading", { name: "推移" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "総記事数、総文字数、増田RUN総プレイ回数の累積推移" })).toBeInTheDocument()
    expect(screen.getByText("総記事数")).toBeInTheDocument()
    expect(screen.getByText("4 本")).toBeInTheDocument()
    expect(screen.getByText("総文字数")).toBeInTheDocument()
    expect(screen.getByText("12 字")).toBeInTheDocument()
    expect(screen.getByText("増田RUN総プレイ回数")).toBeInTheDocument()
    expect(screen.getByText("3 回")).toBeInTheDocument()
    expect(screen.getByText("線は各指標の最大値に合わせて表示しています。")).toBeInTheDocument()
  })

  it("推移データがなければ何も表示しない", () => {
    const { container } = render(<NumbersTrendChart trend={{ series: [], points: [] }} />)

    expect(container).toBeEmptyDOMElement()
  })
})
