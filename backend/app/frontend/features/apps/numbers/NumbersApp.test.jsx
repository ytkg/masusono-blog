import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import useMetrics from "./hooks/useMetrics"
import NumbersApp from "./NumbersApp"

vi.mock("./hooks/useMetrics", () => ({
  default: vi.fn(),
}))

vi.mock("../ui/AppsDrawerLauncher", () => ({
  default: ({ title, onOpen, children }) => (
    <div>
      <button onClick={() => void onOpen()}>{title}</button>
      {children}
    </div>
  ),
}))

vi.mock("./NumbersPreview", () => ({
  default: ({ isLoading }) => <div>{isLoading ? "loading" : "loaded"}</div>,
}))

describe("NumbersApp", () => {
  it("初回 open で有効化し、その後は refresh する", async () => {
    const refresh = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useMetrics).mockImplementation((enabled) => ({
      metrics: null,
      isLoading: enabled,
      hasError: false,
      refresh,
    }))

    render(<NumbersApp />)

    expect(useMetrics).toHaveBeenCalledWith(false)
    fireEvent.click(screen.getByRole("button", { name: "数字でわかる、増田とその他！" }))

    await waitFor(() => {
      expect(useMetrics).toHaveBeenLastCalledWith(true)
    })

    fireEvent.click(screen.getByRole("button", { name: "数字でわかる、増田とその他！" }))

    await waitFor(() => {
      expect(refresh).toHaveBeenCalledTimes(1)
    })
  })
})
