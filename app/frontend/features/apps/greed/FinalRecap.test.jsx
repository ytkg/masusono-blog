import { render, screen, within } from "@testing-library/react"
import { expect, it } from "vitest"
import FinalRecap from "./FinalRecap"

const item = (name, price, quantity) => ({ name, price, quantity, icon: "🍙" })
const free = (round) => ({ round, payer: 1, carts: [[item("塩むすび", 100, 2)], [], []], amounts: [200, 1000, 4000] })
const paid = {
  round: 2,
  payer: 0,
  carts: [[item("ごほうび重", 2000, 5)], [item("塩むすび", 100, 10)], [item("塩むすび", 100, 40)]],
  amounts: [10000, 1000, 4000],
}
it("consolidates only gifts and shows paid round totals and buyer details", () => {
  render(<FinalRecap history={[free(1), paid, free(3)]} />)
  const gifts = screen.getByRole("region", { name: "奢ってもらった商品" })
  expect(within(gifts).getByText("塩むすび ×4")).toBeInTheDocument()
  expect(within(gifts).getByText("合計 400円分")).toBeInTheDocument()
  expect(gifts).not.toHaveTextContent("ごほうび重")
  const payments = screen.getByRole("region", { name: "自分のお支払い" })
  expect(payments).toHaveTextContent("自分のお支払い合計15,000円")
  expect(payments).toHaveTextContent("ラウンド2：15,000円")
  expect(payments.querySelectorAll("details")).toHaveLength(1)
  expect(payments).toHaveTextContent("ごほうび重 ×5 · 10,000円")
  expect(payments).toHaveTextContent("塩むすび ×40 · 4,000円")
})
it("handles games with no payments or no gifts", () => {
  const { rerender } = render(<FinalRecap history={[free(1), free(2), free(3)]} />)
  expect(screen.getByText("合計 600円分")).toBeInTheDocument()
  expect(screen.getByText("お支払い 0円。全部ごちそうになりました")).toBeInTheDocument()
  rerender(<FinalRecap history={[1, 2, 3].map((round) => ({ ...paid, round }))} />)
  expect(screen.getByText("今回は奢ってもらえませんでした")).toBeInTheDocument()
  expect(screen.getByRole("region", { name: "自分のお支払い" })).toHaveTextContent("自分のお支払い合計45,000円")
  expect(document.querySelectorAll("details")).toHaveLength(3)
})
