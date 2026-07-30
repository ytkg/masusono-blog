import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ArticleStructuredHtml from "./ArticleStructuredHtml"

describe("ArticleStructuredHtml", () => {
  it("通常のHTMLを本文として表示する", () => {
    render(<ArticleStructuredHtml html="<p>通常の本文</p><blockquote>引用</blockquote>" />)

    expect(screen.getByTestId("article-body-html")).toHaveTextContent("通常の本文引用")
  })

  it("言語指定付きコードブロックを構造化して表示する", () => {
    render(
      <ArticleStructuredHtml html={'<p>前文</p><pre><code class="language-javascript">const value = 1</code></pre>'} />,
    )

    const shell = screen.getByTestId("article-body-html").querySelector("[data-code-block-shell]")

    expect(shell?.querySelector("[data-code-language-label]")).toHaveTextContent("JavaScript")
    expect(shell?.querySelector('[data-code-language="JavaScript"]')).toHaveTextContent("const value = 1")
    expect(screen.getByTestId("article-body-html")).toHaveTextContent("前文")
  })

  it("言語指定のないコードブロックは本文HTMLとして残す", () => {
    render(<ArticleStructuredHtml html="<pre><code>puts :hello</code></pre>" />)

    expect(screen.getByTestId("article-body-html").querySelector("[data-code-block-shell]")).not.toBeInTheDocument()
    expect(screen.getByText("puts :hello")).toBeInTheDocument()
  })
})
