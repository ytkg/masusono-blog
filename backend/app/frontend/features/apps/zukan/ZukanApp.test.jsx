import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ZukanContent, ZukanTitleAccessory } from "./ZukanApp"
import { zukanEntries } from "./zukanData"

describe("ZukanContent", () => {
  it("図鑑項目を一覧表示する", () => {
    render(
      <>
        <ZukanTitleAccessory />
        <ZukanContent />
      </>,
    )

    expect(screen.getByText("AI分析による人物像")).toBeInTheDocument()
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(zukanEntries.length)
    expect(screen.getAllByText("過去のプロフィールを見る")).toHaveLength(zukanEntries.length)
    expect(screen.getAllByText("以前のプロフィール")).toHaveLength(zukanEntries.length)

    for (const member of zukanEntries) {
      expect(screen.getByText(member.name)).toBeInTheDocument()
      expect(screen.getByText(member.title)).toBeInTheDocument()
      expect(screen.getByRole("img", { name: `${member.name}の人物像イラスト` })).toBeInTheDocument()

      for (const item of member.history ?? []) {
        expect(screen.getByText(item.title)).toBeInTheDocument()
      }
    }
  })
})
