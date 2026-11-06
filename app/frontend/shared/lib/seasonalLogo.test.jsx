import { act, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { setSeasonalLogoEnabled, useSeasonalLogo } from "./seasonalLogo"

function LogoState() {
  return <span>{useSeasonalLogo() ? "限定版" : "通常版"}</span>
}

afterEach(() => {
  document.cookie = "seasonal_logo_20261018_autumn_health=; Max-Age=0; Path=/"
  document.cookie = "seasonal_logo=; Max-Age=0; Path=/"
  document.cookie = "seasonal_logo_other_campaign=; Max-Age=0; Path=/"
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it("未設定・不正値はオフにし、保存後は全購読先に即時反映する", () => {
  document.cookie = "seasonal_logo_20261018_autumn_health=invalid; Path=/"
  render(
    <>
      <LogoState />
      <LogoState />
    </>,
  )
  expect(screen.getAllByText("通常版")).toHaveLength(2)
  act(() => setSeasonalLogoEnabled(true))
  expect(document.cookie).toContain("seasonal_logo_20261018_autumn_health=on")
  expect(screen.getAllByText("限定版")).toHaveLength(2)
  act(() => setSeasonalLogoEnabled(false))
  expect(document.cookie).toContain("seasonal_logo_20261018_autumn_health=off")
  expect(screen.getAllByText("通常版")).toHaveLength(2)
})

it("保存済みのオフを初期表示とフォーカス復帰時に読み取る", () => {
  document.cookie = "seasonal_logo_20261018_autumn_health=off; Path=/"
  render(<LogoState />)
  expect(screen.getByText("通常版")).toBeInTheDocument()
  document.cookie = "seasonal_logo_20261018_autumn_health=on; Path=/"
  act(() => window.dispatchEvent(new Event("focus")))
  expect(screen.getByText("限定版")).toBeInTheDocument()
})

it("1年・全パス・SameSite=Lax を指定して保存する", () => {
  const write = vi.spyOn(document, "cookie", "set")
  setSeasonalLogoEnabled(false)
  expect(write).toHaveBeenCalledWith("seasonal_logo_20261018_autumn_health=off; Max-Age=31536000; Path=/; SameSite=Lax")
})

it("Cookieが保存できなければ成功扱いにせず表示も維持する", () => {
  vi.spyOn(document, "cookie", "set").mockImplementation(() => {})
  render(<LogoState />)
  expect(() => setSeasonalLogoEnabled(true)).toThrow("Logo preference could not be saved")
  expect(screen.getByText("通常版")).toBeInTheDocument()
})

it("共通キーや別の限定ロゴのCookieを引き継がない", () => {
  document.cookie = "seasonal_logo=on; Path=/"
  document.cookie = "seasonal_logo_other_campaign=on; Path=/"
  render(<LogoState />)
  expect(screen.getByText("通常版")).toBeInTheDocument()
})

it("HTTPSでは限定ロゴCookieにSecure属性を付ける", () => {
  vi.stubGlobal("location", { protocol: "https:" })
  vi.spyOn(document, "cookie", "get").mockReturnValue("seasonal_logo_20261018_autumn_health=on")
  const write = vi.spyOn(document, "cookie", "set").mockImplementation(() => {})
  setSeasonalLogoEnabled(true)
  expect(write).toHaveBeenCalledExactlyOnceWith(
    "seasonal_logo_20261018_autumn_health=on; Max-Age=31536000; Path=/; SameSite=Lax; Secure",
  )
})

it("Cookieの読込みが拒否されても通常ロゴを表示できる", () => {
  const read = vi.spyOn(document, "cookie", "get").mockImplementation(() => {
    throw new DOMException("denied", "SecurityError")
  })
  try {
    render(<LogoState />)
    expect(screen.getByText("通常版")).toBeInTheDocument()
    act(() => window.dispatchEvent(new Event("focus")))
    expect(screen.getByText("通常版")).toBeInTheDocument()
  } finally {
    read.mockRestore()
  }
})

it("Cookieの書込みが拒否されたら成功イベントを送らない", () => {
  const onChange = vi.fn()
  window.addEventListener("seasonal-logo-change", onChange)
  const write = vi.spyOn(document, "cookie", "set").mockImplementation(() => {
    throw new DOMException("denied", "SecurityError")
  })
  try {
    expect(() => setSeasonalLogoEnabled(true)).toThrow("denied")
    expect(onChange).not.toHaveBeenCalled()
  } finally {
    write.mockRestore()
    window.removeEventListener("seasonal-logo-change", onChange)
  }
})

it("アンマウントすると変更とフォーカスの購読を解除する", () => {
  const added = vi.spyOn(window, "addEventListener")
  const removed = vi.spyOn(window, "removeEventListener")
  const { unmount } = render(<LogoState />)
  const subscriptions = added.mock.calls.filter(([name]) => ["seasonal-logo-change", "focus"].includes(name))
  expect(subscriptions).toHaveLength(2)
  unmount()
  subscriptions.forEach(([name, listener]) => expect(removed).toHaveBeenCalledWith(name, listener))
})
