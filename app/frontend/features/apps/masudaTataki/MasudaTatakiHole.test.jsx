import { fireEvent, render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import MasudaTatakiHole from "./MasudaTatakiHole"

it("右・中央ボタンを採点せず、通常のpointerとキーボードclickを受け付ける", () => {
  const onTap = vi.fn()
  render(<MasudaTatakiHole index={0} elapsed={0} onTap={onTap} />)
  const hole = screen.getByRole("button", { name: "穴1" })
  fireEvent.pointerDown(hole, { button: 1 })
  fireEvent.pointerDown(hole, { button: 2 })
  expect(onTap).not.toHaveBeenCalled()
  fireEvent.pointerDown(hole, { button: 0 })
  fireEvent.click(hole, { detail: 0 })
  expect(onTap).toHaveBeenCalledTimes(2)
})
