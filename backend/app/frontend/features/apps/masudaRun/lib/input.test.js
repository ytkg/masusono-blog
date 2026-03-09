import { afterEach, describe, expect, it, vi } from "vitest"
import { attachKeyboardHandlers, attachPointerHandler } from "./input"

describe("attachKeyboardHandlers", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("ready/gameover では開始処理を呼ぶ", () => {
    const startOrRestart = vi.fn()
    const doJump = vi.fn()
    const cleanup = attachKeyboardHandlers("ready", startOrRestart, doJump)

    const event = new KeyboardEvent("keydown", { key: " ", cancelable: true })
    window.dispatchEvent(event)

    expect(startOrRestart).toHaveBeenCalledTimes(1)
    expect(doJump).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(true)

    cleanup()
  })

  it("playing ではジャンプし、gameover の r で再開する", () => {
    const startOrRestart = vi.fn()
    const doJump = vi.fn()
    const playingCleanup = attachKeyboardHandlers("playing", startOrRestart, doJump)

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", cancelable: true }))

    expect(doJump).toHaveBeenCalledTimes(1)

    playingCleanup()

    const gameoverCleanup = attachKeyboardHandlers("gameover", startOrRestart, doJump)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "r" }))

    expect(startOrRestart).toHaveBeenCalledTimes(1)

    gameoverCleanup()
  })
})

describe("attachPointerHandler", () => {
  it("state に応じて開始またはジャンプする", () => {
    let pointerdownHandler
    const canvas = {
      addEventListener: vi.fn((eventName, handler) => {
        if (eventName === "pointerdown") pointerdownHandler = handler
      }),
      removeEventListener: vi.fn(),
    }
    const startOrRestart = vi.fn()
    const doJump = vi.fn()
    const cleanup = attachPointerHandler(canvas, "playing", startOrRestart, doJump)

    pointerdownHandler()
    expect(doJump).toHaveBeenCalledTimes(1)

    cleanup()
    expect(canvas.removeEventListener).toHaveBeenCalledWith("pointerdown", pointerdownHandler)
  })
})
