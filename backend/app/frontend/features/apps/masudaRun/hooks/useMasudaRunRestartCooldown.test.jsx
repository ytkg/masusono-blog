import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getNow } from "../lib"
import { useMasudaRunRestartCooldown } from "./useMasudaRunRestartCooldown"

vi.mock("../lib", () => ({
  getNow: vi.fn(),
}))

describe("useMasudaRunRestartCooldown", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it("再開可能時刻を過ぎていれば即座に解除する", () => {
    vi.mocked(getNow).mockReturnValue(1000)
    const restartReadyAtRef = { current: 900 }
    const setRestartReadyAt = vi.fn()

    renderHook(() => useMasudaRunRestartCooldown("gameover", 900, restartReadyAtRef, setRestartReadyAt))

    expect(restartReadyAtRef.current).toBe(0)
    expect(setRestartReadyAt).toHaveBeenCalledWith(0)
  })

  it("残り時間があれば timeout 後に解除する", () => {
    vi.mocked(getNow).mockReturnValue(1000)
    const restartReadyAtRef = { current: 1300 }
    const setRestartReadyAt = vi.fn()

    renderHook(() => useMasudaRunRestartCooldown("gameover", 1300, restartReadyAtRef, setRestartReadyAt))

    expect(setRestartReadyAt).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)

    expect(restartReadyAtRef.current).toBe(0)
    expect(setRestartReadyAt).toHaveBeenCalledWith(0)
  })
})
