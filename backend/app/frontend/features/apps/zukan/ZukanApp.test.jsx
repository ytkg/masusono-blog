import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ZukanApp from "./ZukanApp"
import { zukanEntries } from "./zukanData"

vi.mock("../shared/AppsDrawerLauncher", () => ({
  default: ({ title, titleAccessory, children }) => (
    <div>
      <button>{title}</button>
      {titleAccessory}
      {children}
    </div>
  ),
}))

describe("ZukanApp", () => {
  it("図鑑項目を一覧表示する", () => {
    render(<ZukanApp />)

    expect(screen.getByRole("button", { name: "増その図鑑" })).toBeInTheDocument()
    expect(screen.getByText("AI分析による人物像")).toBeInTheDocument()
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(zukanEntries.length)

    for (const member of zukanEntries) {
      expect(screen.getByText(member.name)).toBeInTheDocument()
      expect(screen.getByText(member.title)).toBeInTheDocument()
      expect(screen.getByRole("img", { name: `${member.name}の人物像イラスト` })).toBeInTheDocument()
    }
  })
})
