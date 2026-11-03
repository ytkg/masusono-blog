import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import MasudaSlotGame from "./MasudaSlotGame"
import { AppActivityProvider } from "../shared/AppActivityContext"

const click = (name) => fireEvent.click(screen.getByRole("button", { name }))
const stopAll = () => ["右", "左", "中"].forEach((reel) => click(`${reel}リール停止`))
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

it("starts at 1000, charges a single bet and accepts keyboard stops even with button focus", () => {
  render(<MasudaSlotGame />)
  vi.spyOn(Math, "random").mockReturnValue(0.99)
  expect(screen.getByLabelText("残高 1000ポイント")).toBeInTheDocument()
  click(/レバー/)
  expect(screen.getByLabelText("残高 997ポイント")).toBeInTheDocument()
  const left = screen.getByRole("button", { name: "左リール停止" })
  left.focus()
  for (const code of ["Digit3", "Digit1", "Digit2"]) fireEvent.keyDown(left, { code })
  expect(screen.getByRole("button", { name: "中リール停止" })).toBeDisabled()
  expect(screen.getByText("1 G · BONUS 0")).toBeInTheDocument()
})

it("preserves credit and reel positions while hidden or inactive and blocks input", () => {
  vi.useFakeTimers()
  const tree = (active) => (
    <AppActivityProvider value={active}>
      <MasudaSlotGame />
    </AppActivityProvider>
  )
  const { rerender } = render(tree(true))
  vi.spyOn(Math, "random").mockReturnValue(0.99)
  click(/レバー/)
  act(() => vi.advanceTimersByTime(100))
  const strip = document.querySelector(".slot-strip")
  const before = strip.style.transform
  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true)
  act(() => document.dispatchEvent(new Event("visibilitychange")))
  act(() => vi.advanceTimersByTime(10000))
  expect(strip.style.transform).toBe(before)
  expect(screen.getByRole("button", { name: "左リール停止" })).toBeDisabled()
  rerender(tree(false))
  hidden.mockReturnValue(false)
  act(() => document.dispatchEvent(new Event("visibilitychange")))
  expect(screen.getByRole("button", { name: "左リール停止" })).toBeDisabled()
  rerender(tree(true))
  expect(screen.getByLabelText("残高 997ポイント")).toBeInTheDocument()
  stopAll()
})

it("keeps bonus type secret until entry and supports canceling auto after a payout", () => {
  vi.useFakeTimers()
  render(<MasudaSlotGame />)
  vi.spyOn(Math, "random").mockReturnValueOnce(0).mockReturnValue(0.99)
  click(/レバー/)
  expect(screen.getByLabelText("野望ランプ点灯 ボーナス当選")).toBeInTheDocument()
  expect(screen.queryByText("BIG 入賞！ 7・7・7")).not.toBeInTheDocument()
  act(() => vi.advanceTimersByTime(688))
  stopAll()
  expect(screen.getByText("BIG 入賞！ 7・7・7")).toBeInTheDocument()
  click("オート消化")
  for (let i = 0; i < 30 && !screen.queryByText("ベル！ +9pt"); i++) act(() => vi.advanceTimersByTime(400))
  expect(screen.getByText("ベル！ +9pt")).toBeInTheDocument()
  click("オートを解除")
  expect(screen.getByRole("button", { name: "オート消化" })).toHaveAttribute("aria-pressed", "false")
  const credit = screen.getByLabelText(/残高/).textContent
  act(() => vi.advanceTimersByTime(10000))
  expect(screen.getByLabelText(/残高/).textContent).toBe(credit)
})

it("pauses for help and resets after unmount without writing storage", () => {
  const storage = vi.spyOn(Storage.prototype, "setItem")
  const { unmount } = render(<MasudaSlotGame />)
  vi.spyOn(Math, "random").mockReturnValue(0.99)
  click(/レバー/)
  click("遊び方・配列表")
  expect(screen.getByRole("dialog", { name: "遊び方・配列表" })).toBeInTheDocument()
  expect(screen.getByText(/リール配列/)).toBeInTheDocument()
  expect(screen.getByRole("button", { name: "ゲームに戻る" })).toBeInTheDocument()
  unmount()
  render(<MasudaSlotGame />)
  expect(screen.getByLabelText("残高 1000ポイント")).toBeInTheDocument()
  expect(storage).not.toHaveBeenCalled()
})

it("ignores an animation frame delivered after its reel has stopped", () => {
  const frames = []
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.push(callback)
    return frames.length
  })
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {})
  vi.spyOn(Math, "random").mockReturnValue(0.99)
  render(<MasudaSlotGame />)
  click(/レバー/)
  const staleFrame = frames.at(-1)
  click("左リール停止")
  const strip = document.querySelector(".slot-strip")
  const stopped = strip.style.transform
  act(() => {
    staleFrame(1000)
    staleFrame(1050)
  })
  expect(strip.style.transform).toBe(stopped)
})
