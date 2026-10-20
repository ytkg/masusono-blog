import { describe, expect, it } from "vitest"
import theme from "./theme"

describe("theme", () => {
  it("主要な palette とコンポーネント override を持つ", () => {
    expect(theme.palette.mode).toBe("light")
    expect(theme.palette.primary.main).toBe("#7045a0")
    expect(theme.components.MuiButton.styleOverrides.root.minHeight).toBe(44)
    expect(theme.typography.fontFamily).toContain("M PLUS Rounded 1c")
  })
})
