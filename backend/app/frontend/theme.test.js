import { describe, expect, it } from "vitest"
import theme from "./theme"

describe("theme", () => {
  it("主要な palette とコンポーネント override を持つ", () => {
    expect(theme.palette.mode).toBe("light")
    expect(theme.palette.primary.main).toBe("#000000")
    expect(theme.components.MuiButton.styleOverrides.contained.backgroundColor).toBe("#000")
    expect(theme.typography.fontFamily).toContain("Noto Sans JP")
  })
})
