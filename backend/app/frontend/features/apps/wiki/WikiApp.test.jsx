import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { WikiContent } from "./WikiApp"

const entries = [
  {
    authorName: "増田",
    summaryParagraphs: [{ text: "人との関係をよく考えている。", referenceIds: ["rbba71-kn"] }],
    facts: [{ label: "好きな娯楽", value: "M-1" }],
    sections: [
      {
        title: "好きなもの",
        paragraphs: [{ text: "M-1にハマっている。", referenceIds: ["rbba71-kn"] }],
      },
    ],
    references: [{ id: "rbba71-kn", title: "今更M-1どハマり🏆" }],
  },
  {
    authorName: "その他1",
    summaryParagraphs: [{ text: "作ることと運営することがつながっている。", referenceIds: ["xvcislgrnxkx"] }],
    facts: [{ label: "作ったもの", value: "ブログ用エディタ" }],
    sections: [
      {
        title: "作ったもの",
        paragraphs: [{ text: "ブログ用の専用エディタを作った。", referenceIds: ["xvcislgrnxkx"] }],
      },
    ],
    references: [{ id: "xvcislgrnxkx", title: "ブログ用エディタを作った" }],
  },
]

describe("WikiContent", () => {
  it("最初の著者のWikiを表示する", () => {
    render(<WikiContent entries={entries} />)

    expect(screen.getByText("各記事をもとに確認できた事実を整理している。推測は含まない。")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "増田" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("heading", { name: "増田" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "概要" })).toBeInTheDocument()
    expect(screen.getByText("人との関係をよく考えている。")).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "[1]" }).length).toBeGreaterThan(0)
    expect(screen.getByText("好きな娯楽")).toBeInTheDocument()
    expect(screen.getByText("M-1")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "好きなもの" })).toBeInTheDocument()
    expect(screen.getByText("M-1にハマっている。")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "参考文献" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "今更M-1どハマり🏆" })).toHaveAttribute("href", "/articles/rbba71-kn")
  })

  it("著者タブを切り替えると内容も切り替わる", () => {
    render(<WikiContent entries={entries} />)

    fireEvent.click(screen.getByRole("tab", { name: "その他1" }))

    expect(screen.getByRole("tab", { name: "その他1" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("heading", { name: "その他1" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "概要" })).toBeInTheDocument()
    expect(screen.getByText("作ることと運営することがつながっている。")).toBeInTheDocument()
    expect(screen.getByRole("rowheader", { name: "作ったもの" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "ブログ用エディタ" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "作ったもの" })).toBeInTheDocument()
    expect(screen.getByText("ブログ用の専用エディタを作った。")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "参考文献" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "ブログ用エディタを作った" })).toHaveAttribute(
      "href",
      "/articles/xvcislgrnxkx",
    )
  })
})
