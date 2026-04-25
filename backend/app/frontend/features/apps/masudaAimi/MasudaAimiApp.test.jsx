import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import MasudaAimiApp from "./MasudaAimiApp"

vi.mock("../shared/AppsDrawerLauncher", () => ({
  default: ({ title, children, onClose }) => {
    const handleClose = () => onClose?.()

    return (
      <div>
        <button>{title}</button>
        {children}
        <button onClick={handleClose}>閉じる</button>
      </div>
    )
  },
}))

describe("MasudaAimiApp", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("初期表示で増田AI美の挨拶を出す", () => {
    render(<MasudaAimiApp />)

    expect(screen.getByRole("button", { name: "増田AI美" })).toBeInTheDocument()
    expect(screen.getByText("こんにちは")).toBeInTheDocument()
  })

  it("メッセージ送信後は入力中を出してから固定でこんにちはを返す", () => {
    render(<MasudaAimiApp />)

    fireEvent.change(screen.getByRole("textbox", { name: "メッセージ入力" }), {
      target: { value: "元気？" },
    })
    fireEvent.click(screen.getByRole("button", { name: "送信" }))

    expect(screen.getByDisplayValue("")).toBeInTheDocument()
    expect(screen.getByText("元気？")).toBeInTheDocument()
    expect(screen.getByTestId("masuda-aimi-typing")).toBeInTheDocument()
    expect(screen.getByText("増田AI美が入力中...")).toBeInTheDocument()
    expect(screen.getAllByText("こんにちは")).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(screen.queryByTestId("masuda-aimi-typing")).not.toBeInTheDocument()
    expect(screen.getAllByText("こんにちは")).toHaveLength(2)
  })

  it("閉じて開き直すと会話履歴を初期化する", () => {
    render(<MasudaAimiApp />)

    fireEvent.change(screen.getByRole("textbox", { name: "メッセージ入力" }), {
      target: { value: "元気？" },
    })
    fireEvent.click(screen.getByRole("button", { name: "送信" }))

    expect(screen.getByText("元気？")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }))
    fireEvent.click(screen.getByRole("button", { name: "増田AI美" }))

    expect(screen.queryByText("元気？")).not.toBeInTheDocument()
    expect(screen.queryByTestId("masuda-aimi-typing")).not.toBeInTheDocument()
    expect(screen.getAllByText("こんにちは")).toHaveLength(1)
  })
})
