import { render, screen, within } from "@testing-library/react"
import { expect, it } from "vitest"
import Receipt from "./Receipt"
import { emptyCart } from "./game"

it("combines everybody's products without identifying shoppers and matches the payment total", () => {
  const carts = [emptyCart(), emptyCart(), emptyCart()]
  carts[0][0] = 2
  carts[0][7] = 1
  carts[1][0] = 3
  carts[2][7] = 2
  render(<Receipt carts={carts} round={2} />)
  const receipt = screen.getByRole("region", { name: "会計レシート" })
  expect(within(receipt).queryByText(/あなた|CPU|の商品/)).not.toBeInTheDocument()
  const table = within(receipt).getByRole("table", { name: "お買い上げ明細" })
  const rows = within(table).getAllByRole("row")
  expect(rows).toHaveLength(3)
  expect(
    within(rows[1])
      .getAllByRole("cell")
      .map((cell) => cell.textContent),
  ).toEqual(["塩むすび単価 100円", "5", "500円"])
  expect(
    within(rows[2])
      .getAllByRole("cell")
      .map((cell) => cell.textContent),
  ).toEqual(["ごほうび重単価 2,000円", "3", "6,000円"])
  expect(within(receipt).getByText("お支払い合計：6,500円")).toBeInTheDocument()
  expect(within(receipt).getByText("お買い上げ数量 8個", { exact: false })).toBeInTheDocument()
  expect(within(receipt).getByText("レジ01 取引 0002", { exact: false })).toBeInTheDocument()
})
