import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import HomeRecommendedArticles from "./HomeRecommendedArticles"

vi.mock("@inertiajs/react", async () => {
  const React = await import("react")
  return {
    Link: React.forwardRef(function MockLink({ href, prefetch: _prefetch, children, ...props }, ref) {
      return (
        <a ref={ref} href={href} {...props}>
          {children}
        </a>
      )
    }),
  }
})

describe("HomeRecommendedArticles", () => {
  it("おすすめ記事を3件表示する", () => {
    render(<HomeRecommendedArticles />)

    expect(screen.getByRole("heading", { name: "おすすめ記事" })).toBeInTheDocument()
    expect(screen.getByText("読後感、ブログらしさ、入りやすさでAIが選定")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /言葉は本当に本心を表しているのか/ })).toHaveAttribute(
      "href",
      "/blog/7149ji78dg2w",
    )
    expect(screen.getByRole("link", { name: /余白とは、愛なのかもしれない/ })).toHaveAttribute(
      "href",
      "/blog/h7yiloouf_kh",
    )
    expect(screen.getByRole("link", { name: /パインバーグディッシュ/ })).toHaveAttribute("href", "/blog/zm5_f8m7vw")
    expect(screen.getByRole("img", { name: "本と言葉をイメージしたアイキャッチ" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "余白と歩みをイメージしたアイキャッチ" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "パインバーグディッシュをイメージしたアイキャッチ" })).toBeInTheDocument()
  })
})
