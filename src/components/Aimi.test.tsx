import { act, fireEvent, render, screen } from "@testing-library/react"
import { vi } from "vitest"
import Aimi from "./Aimi"

describe("Aimi", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("クリックで吹き出しを表示し、コールバックを呼び出す", () => {
    const handleClick = vi.fn()
    render(<Aimi alt="Aimi" ouchText="いたい" onClick={handleClick} />)

    fireEvent.click(screen.getByRole("button", { name: "Aimi" }))

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(screen.getByText("いたい")).toBeInTheDocument()
    expect(screen.getByAltText("Aimi")).toBeInTheDocument()

    act(() => {
      vi.runAllTimers()
    })

    expect(screen.queryByText("いたい")).not.toBeInTheDocument()
  })
})
