import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import PwaInstallButton from "./PwaInstallButton"

function setUserAgent(value) {
  Object.defineProperty(window.navigator, "userAgent", {
    value,
    configurable: true,
  })
}

function buildMediaQueryList(matches = false) {
  return {
    matches,
    media: "",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
}

describe("PwaInstallButton", () => {
  beforeEach(() => {
    setUserAgent("Mozilla/5.0")
    window.matchMedia = vi.fn().mockReturnValue(buildMediaQueryList(false))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("iOS では案内文つきの無効ボタンを表示する", () => {
    setUserAgent("iPhone")

    render(<PwaInstallButton />)

    expect(screen.getByRole("button", { name: "iOSは共有メニューからホーム画面追加" })).toBeDisabled()
  })

  it("beforeinstallprompt 後にインストールボタンを表示し、押下で prompt する", async () => {
    const prompt = vi.fn()
    render(<PwaInstallButton />)

    const event = new Event("beforeinstallprompt")
    Object.defineProperty(event, "preventDefault", { value: vi.fn() })
    Object.defineProperty(event, "prompt", { value: prompt })
    Object.defineProperty(event, "userChoice", { value: Promise.resolve({ outcome: "accepted" }) })

    act(() => {
      window.dispatchEvent(event)
    })

    fireEvent.click(screen.getByRole("button", { name: "アプリをインストール" }))

    await waitFor(() => {
      expect(prompt).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "アプリをインストール" })).not.toBeInTheDocument()
    })
  })

  it("standalone モードでは何も表示しない", () => {
    window.matchMedia = vi.fn().mockReturnValue(buildMediaQueryList(true))

    const { container } = render(<PwaInstallButton />)

    expect(container).toBeEmptyDOMElement()
  })
})
