import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AuthorsIndex from "./index"

const authors = [
  {
    id: "9wgrey2lh3",
    name: "増田",
    title: "友達と行事に全力で参加する人",
    bio: "プロフィール本文",
    imageUrl: "/masuda.webp",
  },
]

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title, canonicalPath }) => <div>{`seo:${title}:${canonicalPath}`}</div>,
}))

describe("AuthorsIndex page", () => {
  it("著者一覧をページとして表示する", () => {
    render(<AuthorsIndex authors={authors} />)

    expect(screen.getByText("seo:著者:/authors")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "著者" })).toBeInTheDocument()
    expect(screen.queryByText("AI分析による人物像")).not.toBeInTheDocument()
    expect(screen.queryByText("AIが考えたプロフィール文")).not.toBeInTheDocument()
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(authors.length)
  })
})
