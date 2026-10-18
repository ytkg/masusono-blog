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
