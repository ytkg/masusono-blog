import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import CollapsedMiniPlayerThumbnail from "./CollapsedMiniPlayerThumbnail"

describe("CollapsedMiniPlayerThumbnail", () => {
  it("クリック、キー入力、ポインター開始を処理する", () => {
    const onExpand = vi.fn()
    const onStartDrag = vi.fn()

    render(<CollapsedMiniPlayerThumbnail title="第1回" onExpand={onExpand} onStartDrag={onStartDrag} />)

    const button = screen.getByRole("button", { name: "ミニプレイヤーを展開" })
    fireEvent.pointerDown(button)
    fireEvent.click(button)
    fireEvent.keyDown(button, { key: "Enter" })
    fireEvent.keyDown(button, { key: " " })

    expect(onStartDrag).toHaveBeenCalledTimes(1)
    expect(onExpand).toHaveBeenCalledTimes(3)
  })
})
