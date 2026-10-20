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
it("consolidates all acquired products and shows paid round totals and buyer details", () => {
  render(<FinalRecap history={[free(1), paid, free(3)]} />)
  const acquired = screen.getByRole("region", { name: "手に入った商品" })
  expect(within(acquired).getByText("塩むすび ×4")).toBeInTheDocument()
  expect(within(acquired).getByText("合計 10,400円分")).toBeInTheDocument()
  expect(within(acquired).getByText("ごほうび重 ×5")).toBeInTheDocument()
  const payments = screen.getByRole("region", { name: "自分のお支払い" })
  expect(payments).toHaveTextContent("自分のお支払い合計15,000円")
  expect(payments).toHaveTextContent("ラウンド2：15,000円")
  expect(payments.querySelectorAll("details")).toHaveLength(1)
  expect(payments).toHaveTextContent("ごほうび重 ×5 · 10,000円")
  expect(payments).toHaveTextContent("塩むすび ×40 · 4,000円")
})
it("includes self-paid products even when paying every round", () => {
  const { rerender } = render(<FinalRecap history={[free(1), free(2), free(3)]} />)
  expect(screen.getByText("合計 600円分")).toBeInTheDocument()
  expect(screen.getByText("お支払い 0円。全部ごちそうになりました")).toBeInTheDocument()
  rerender(<FinalRecap history={[1, 2, 3].map((round) => ({ ...paid, round }))} />)
  expect(screen.getByText("ごほうび重 ×15")).toBeInTheDocument()
  expect(screen.getByRole("region", { name: "手に入った商品" })).not.toHaveTextContent("塩むすび")
  expect(screen.getByText("合計 30,000円分")).toBeInTheDocument()
  expect(screen.queryByText("今回は奢ってもらえませんでした")).not.toBeInTheDocument()
  expect(screen.getByRole("region", { name: "自分のお支払い" })).toHaveTextContent("自分のお支払い合計45,000円")
  expect(document.querySelectorAll("details")).toHaveLength(3)
})
