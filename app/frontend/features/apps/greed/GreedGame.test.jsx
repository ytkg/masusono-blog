import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, expect, it, vi } from "vitest"
import GreedGame from "./GreedGame"
import { AppActivityProvider } from "../shared/AppActivityContext"
import { BEST_KEY } from "./game"

vi.mock("@inertiajs/react", async () => {
  const { MockInertiaLinkWithoutPrefetch } = await import("@/test/inertiaLinkMocks")
  return { Link: MockInertiaLinkWithoutPrefetch }
})

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(Math, "random").mockReturnValue(0.5)
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})
const click = (name) => fireEvent.click(screen.getByRole("button", { name, exact: true }))
it("updates quantity, caps purchases and freezes CPU baskets", () => {
  render(<GreedGame />)
  expect(screen.getByRole("link", { name: "強欲は身を滅ぼす？を読む →" })).toHaveAttribute(
    "href",
    "/articles/uqu8cokro",
  )
  click("買い物を始める")
  expect(screen.queryByRole("link")).not.toBeInTheDocument()
  const cpu = screen.getByRole("heading", { name: /CPU1/ }).textContent
  expect(screen.getByRole("button", { name: "カゴを確定して勝負" })).toBeDisabled()
  for (let i = 0; i < 5; i++) click("ごほうび重を追加")
  expect(screen.getByText("あなたのカゴ：10,000円 / 10,000円")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "塩むすびを追加", exact: true })).toBeDisabled()
  click("ごほうび重を減らす")
  expect(screen.getByText("あなたのカゴ：8,000円 / 10,000円")).toBeInTheDocument()
  expect(screen.getByRole("heading", { name: /CPU1/ }).textContent).toBe(cpu)
  click("カゴを確定して勝負")
  expect(screen.queryByRole("button", { name: "ごほうび重を追加" })).not.toBeInTheDocument()
})
it("saves only a completed three-round score, before dismissing the last receipt", () => {
  render(<GreedGame />)
  click("買い物を始める")
  for (let round = 1; round <= 3; round++) {
    click("塩むすびを追加")
    click("カゴを確定して勝負")
    for (let n = 0; n < 6 && !screen.queryByText("領収証"); n++) {
      if (screen.queryByRole("button", { name: "✊ グー", exact: true })) click("✊ グー")
      else click("次のじゃんけんへ")
    }
    expect(screen.getByText(`現在の合計スコア：${round * 100}円`)).toBeInTheDocument()
    expect(localStorage.getItem(BEST_KEY)).toBe(round === 3 ? "300" : null)
    click(round === 3 ? "最終結果を見る" : "次のラウンドへ")
  }
  expect(screen.getByText("自己ベスト：300円")).toBeInTheDocument()
  expect(screen.getByRole("link", { name: "元になった記事を読む →" })).toHaveAttribute("href", "/articles/uqu8cokro")
  click("再挑戦")
  expect(screen.getByText("あなたのカゴ：0円 / 10,000円")).toBeInTheDocument()
})
it("pauses CPU decisions and blocks input while inactive", () => {
  vi.useFakeTimers()
  const tree = (active) => (
    <AppActivityProvider value={active}>
      <GreedGame />
    </AppActivityProvider>
  )
  const { rerender } = render(tree(true))
  click("買い物を始める")
  click("塩むすびを追加")
  click("カゴを確定して勝負")
  // Select a decisive two-winner match with the human eliminated.
  vi.mocked(Math.random).mockReturnValueOnce(0.5).mockReturnValueOnce(0.99)
  click("✊ グー")
  expect(screen.getByText("CPU同士の決戦へ進みます…")).toBeInTheDocument()
  rerender(tree(false))
  const before = screen.getByText(/ラウンド 1/).textContent
  act(() => vi.advanceTimersByTime(60000))
  expect(screen.getByText(/ラウンド 1/).textContent).toBe(before)
  expect(screen.queryByText("領収証")).not.toBeInTheDocument()
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden")
  act(() => document.dispatchEvent(new Event("visibilitychange")))
  rerender(tree(true))
  act(() => vi.advanceTimersByTime(60000))
  expect(screen.queryByText("領収証")).not.toBeInTheDocument()
  visibility.mockReturnValue("visible")
  act(() => document.dispatchEvent(new Event("visibilitychange")))
  act(() => vi.advanceTimersByTime(1200))
  act(() => vi.advanceTimersByTime(1200))
  expect(screen.getByText("領収証")).toBeInTheDocument()
})
it("uses full payments as losses for the score and best, keeps full receipts, and clears the closing sentence on retry", () => {
  render(<GreedGame />)
  click("買い物を始める")
  for (let round = 1; round <= 3; round++) {
    for (let i = 0; i < 5; i++) click("ごほうび重を追加")
    click("カゴを確定して勝負")
    for (let n = 0; n < 6 && !screen.queryByText("領収証"); n++) {
      if (screen.queryByRole("button", { name: "✊ グー", exact: true })) click("✊ グー")
      else click("次のじゃんけんへ")
    }
    expect(screen.getByText("お支払い合計：17,900円")).toBeInTheDocument()
    expect(screen.getByText("今回のスコア：-17,900円")).toBeInTheDocument()
    expect(screen.queryByText("今日は納豆ご飯だ。")).not.toBeInTheDocument()
    click(round === 3 ? "最終結果を見る" : "次のラウンドへ")
  }
  expect(screen.getByText("自己ベスト：-53,700円")).toBeInTheDocument()
  expect(localStorage.getItem(BEST_KEY)).toBe("-53700")
  expect(screen.getByText("今日は納豆ご飯だ。")).toBeInTheDocument()
  click("再挑戦")
  expect(screen.queryByText("今日は納豆ご飯だ。")).not.toBeInTheDocument()
  expect(screen.getByText("あなたのカゴ：0円 / 10,000円")).toBeInTheDocument()
})
