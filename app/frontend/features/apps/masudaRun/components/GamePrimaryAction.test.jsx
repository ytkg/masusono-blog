import { act, fireEvent, render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import GamePrimaryAction from "./GamePrimaryAction"

it("長押し後の合成clickで二重操作せず、キーボードclickを受け付ける", () => {
  vi.useFakeTimers()
  try {
    const onAction = vi.fn()
    render(<GamePrimaryAction state="playing" onAction={onAction} />)
    const button = screen.getByRole("button", { name: "ジャンプ" })
    fireEvent.pointerDown(button, { button: 0 })
    act(() => vi.advanceTimersByTime(500))
    fireEvent.click(button, { detail: 1 })
    expect(onAction).toHaveBeenCalledTimes(1)
    fireEvent.click(button, { detail: 0 })
    expect(onAction).toHaveBeenCalledTimes(2)
    fireEvent.pointerDown(button, { button: 2 })
    expect(onAction).toHaveBeenCalledTimes(2)
  } finally {
    vi.useRealTimers()
  }
})
