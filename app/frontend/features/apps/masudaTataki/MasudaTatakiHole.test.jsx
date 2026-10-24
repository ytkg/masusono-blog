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

it("早叩きとコンボボーナスの内訳、減点なしの誤タップを表示する", () => {
  const props = { index: 0, elapsed: 100, onTap: vi.fn() }
  const { rerender } = render(
    <MasudaTatakiHole
      {...props}
      character={{ kind: "masuda", image: 0, hit: true, fast: true, basePoints: 150, bonus: 500, points: 650 }}
    />,
  )
  expect(screen.getByText("早い！＋150")).toBeInTheDocument()
  expect(screen.getByText("コンボ＋500")).toBeInTheDocument()
  rerender(
    <MasudaTatakiHole
      {...props}
      character={{ kind: "masuda", image: 0, hit: true, fast: false, basePoints: 100, bonus: 0, points: 100 }}
    />,
  )
  expect(screen.getByText("＋100")).toBeInTheDocument()
  expect(screen.queryByText(/コンボ＋/)).not.toBeInTheDocument()
  rerender(<MasudaTatakiHole {...props} character={{ kind: "other", image: 1, hit: true, points: 0 }} />)
  expect(screen.getByText("コンボ終了")).toBeInTheDocument()
})
