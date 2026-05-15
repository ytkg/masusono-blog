import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ZukanContent } from "./ZukanApp"

vi.mock("@inertiajs/react", async () => {
  const React = await import("react")
  return {
    Link: React.forwardRef(function MockLink({ href, children, ...props }, ref) {
      return (
        <a ref={ref} href={href} {...props}>
          {children}
        </a>
      )
    }),
  }
})

const authors = [
  {
    id: "9wgrey2lh3",
    name: "増田",
    title: "友達と行事に全力で参加する人",
    bio: "プロフィール本文",
    imageUrl: "/masuda.webp",
  },
]

describe("ZukanContent", () => {
  it("図鑑項目を一覧表示する", () => {
    render(<ZukanContent authors={authors} />)

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(authors.length)
    expect(screen.queryByText("AIが考えたプロフィール文")).not.toBeInTheDocument()
    expect(screen.queryByText("過去のプロフィールを見る")).not.toBeInTheDocument()
    expect(screen.queryByText("以前のプロフィール")).not.toBeInTheDocument()

    for (const member of authors) {
      expect(screen.getByText(member.name)).toBeInTheDocument()
      expect(screen.getByText(member.title)).toBeInTheDocument()
      expect(screen.getByRole("img", { name: `${member.name}の人物像イラスト` })).toBeInTheDocument()
      expect(screen.getByText(member.bio)).toBeInTheDocument()
      expect(screen.getByRole("link", { name: `${member.name}の記事を読む` })).toHaveAttribute(
        "href",
        `/authors/${member.id}`,
      )
    }
  })
})
