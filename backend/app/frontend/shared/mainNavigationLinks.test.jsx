import { describe, expect, it } from "vitest"
import { MAIN_NAVIGATION_LINKS } from "./mainNavigationLinks"

describe("MAIN_NAVIGATION_LINKS", () => {
  it("主要画面を重複しない値とURLで定義する", () => {
    expect(MAIN_NAVIGATION_LINKS.map((link) => link.value)).toEqual(["home", "search", "authors", "numbers", "others"])
    expect(new Set(MAIN_NAVIGATION_LINKS.map((link) => link.href)).size).toBe(MAIN_NAVIGATION_LINKS.length)
    expect(MAIN_NAVIGATION_LINKS.every((link) => link.icon && link.label && link.href.startsWith("/"))).toBe(true)
  })
})
