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

  it.each([" ", "ArrowUp"])("%sのkeyupでは既定操作だけを抑止し、長押しと解除後は反応しない", (key) => {
    const startOrRestart = vi.fn()
    const doJump = vi.fn()
    const cleanup = attachKeyboardHandlers("gameover", startOrRestart, doJump)
    const release = new KeyboardEvent("keyup", { key, cancelable: true })

    window.dispatchEvent(release)
    window.dispatchEvent(new KeyboardEvent("keydown", { key, repeat: true }))
    expect(release.defaultPrevented).toBe(true)
    expect(startOrRestart).not.toHaveBeenCalled()
    expect(doJump).not.toHaveBeenCalled()

    window.dispatchEvent(new KeyboardEvent("keydown", { key }))
    expect(startOrRestart).toHaveBeenCalledTimes(1)
    cleanup()
    window.dispatchEvent(new KeyboardEvent("keydown", { key }))
    expect(startOrRestart).toHaveBeenCalledTimes(1)
  })

  it("対象外のキーを抑止せず、大文字Rでも再開できる", () => {
    const startOrRestart = vi.fn()
    const cleanup = attachKeyboardHandlers("gameover", startOrRestart, vi.fn())
    const unrelated = new KeyboardEvent("keyup", { key: "a", cancelable: true })

    window.dispatchEvent(unrelated)
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }))
    expect(unrelated.defaultPrevented).toBe(false)
    expect(startOrRestart).not.toHaveBeenCalled()
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "R" }))
    expect(startOrRestart).toHaveBeenCalledTimes(1)
    cleanup()
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

    pointerdownHandler({ button: 0 })
    expect(doJump).toHaveBeenCalledTimes(1)

    cleanup()
    expect(canvas.removeEventListener).toHaveBeenCalledWith("pointerdown", pointerdownHandler)
  })
})

it.each(["input", "textarea", "select", "button", "a", "div"])("keeps native editing and controls on %s", (tag) => {
  const target = document.createElement(tag)
  if (tag === "div") target.contentEditable = "true"
  if (tag === "div") target.setAttribute("contenteditable", "true")
  document.body.append(target)
  const start = vi.fn()
  const jump = vi.fn()
  const cleanup = attachKeyboardHandlers("ready", start, jump)
  const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  expect(event.defaultPrevented).toBe(false)
  expect(start).not.toHaveBeenCalled()
  cleanup()
  target.remove()
})

it.each([{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { isComposing: true }])(
  "ignores modified/composing keys: %j",
  (options) => {
    const start = vi.fn()
    const cleanup = attachKeyboardHandlers("ready", start, vi.fn())
    const event = new KeyboardEvent("keydown", { key: " ", cancelable: true, ...options })
    window.dispatchEvent(event)
    expect(start).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
    cleanup()
  },
)

it("ignores secondary pointers on the RUN canvas", () => {
  const canvas = document.createElement("canvas")
  const start = vi.fn()
  const cleanup = attachPointerHandler(canvas, "ready", start, vi.fn())
  for (const button of [1, 2]) canvas.dispatchEvent(new MouseEvent("pointerdown", { button }))
  expect(start).not.toHaveBeenCalled()
  canvas.dispatchEvent(new MouseEvent("pointerdown", { button: 0 }))
  expect(start).toHaveBeenCalledOnce()
  cleanup()
})
