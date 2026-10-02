import { describe, expect, it } from "vitest"
import theme from "./theme"

describe("theme", () => {
  it("主要な palette とコンポーネント override を持つ", () => {
    expect(theme.palette.mode).toBe("light")
    expect(theme.palette.primary.main).toBe("#e54520")
    expect(theme.components.MuiButton.styleOverrides.contained.backgroundColor).toBe("#252820")
    expect(theme.typography.fontFamily).toContain("Hiragino Sans")
  })
})
