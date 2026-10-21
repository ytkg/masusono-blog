import { render, screen } from "@testing-library/react"
import { useReducer } from "react"
import { expect, it, vi } from "vitest"
import GreedGame from "./GreedGame"
import { PRODUCTS } from "./game"

vi.mock("react", async (original) => ({ ...(await original()), useReducer: vi.fn() }))
vi.mock("@inertiajs/react", async () => {
  const { MockInertiaLinkWithoutPrefetch } = await import("@/test/inertiaLinkMocks")
  return { Link: MockInertiaLinkWithoutPrefetch }
})

it.each([-10001, -10000, -9999, 0, 100])(
  "shows the closing sentence only for a final score <= -10000 (%i)",
  (score) => {
    vi.mocked(useReducer).mockReturnValue([{ phase: "final", score, history: [] }, vi.fn()])
    render(<GreedGame />)
    const sentence = screen.queryByText("今日は納豆ご飯だ。", { exact: true })
    if (score <= -10000) {
      expect(sentence).toBeInTheDocument()
      const recap = screen.getByRole("region", { name: "自分のお支払い" })
      const retry = screen.getByRole("button", { name: "再挑戦", exact: true })
      expect(recap.compareDocumentPosition(sentence) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(sentence.compareDocumentPosition(retry) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    } else expect(sentence).not.toBeInTheDocument()
  },
)
it("does not show the sentence on the title or an unfinished round even below the threshold", () => {
  const carts = Array.from({ length: 3 }, () => PRODUCTS.map(() => 0))
  vi.mocked(useReducer).mockReturnValue([{ phase: "title", score: -10001 }, vi.fn()])
  const { rerender } = render(<GreedGame />)
  expect(screen.queryByText("今日は納豆ご飯だ。")).not.toBeInTheDocument()
  vi.mocked(useReducer).mockReturnValue([
    {
      phase: "result",
      round: 2,
      score: -10001,
      carts,
      history: [{ carts: [[], [], []] }],
      payer: 0,
      delta: -10001,
      result: {},
    },
    vi.fn(),
  ])
  rerender(<GreedGame />)
  expect(screen.queryByText("今日は納豆ご飯だ。")).not.toBeInTheDocument()
})
