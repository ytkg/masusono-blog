import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import NumbersMetricsTable from "./NumbersMetricsTable"

describe("NumbersMetricsTable", () => {
  it("対象ごとの記事数・文字数・平均を同じ行に表示する", () => {
    render(
      <NumbersMetricsTable
        rows={[
          { label: "全体", articles: "2 本", chars: "100 字", averageChars: "50 字" },
          { label: "増田", articles: "0 本", chars: "0 字", averageChars: "—" },
        ]}
      />,
    )
    const table = screen.getByRole("table", { name: "対象別の記事の指標" })
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["対象", "総記事数", "総文字数", "平均文字数"])
    const rows = within(table).getAllByRole("row")
    expect(rows[1]).toHaveTextContent("全体2 本100 字50 字")
    expect(rows[2]).toHaveTextContent("増田0 本0 字—")
    expect(within(rows[2]).getByRole("rowheader")).toHaveTextContent("増田")
    expect(screen.getByRole("region")).toHaveAttribute("tabindex", "0")
  })
})
