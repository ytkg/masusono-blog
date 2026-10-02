import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ArticleStructuredHtml from "./ArticleStructuredHtml"

vi.mock("./RubyExecutableCodeBlock", () => ({
  default: ({ code, html }) => (
    <div data-testid="ruby-runner" data-source-html={html}>
      {code}
    </div>
  ),
}))

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
  it("複数のコードブロックと間の本文を保ち、Ruby実行は許可された場合だけ表示する", () => {
    const rubyHtml = '<pre><code class="lang-ruby">puts &quot;hello&quot;</code></pre>'
    const html = `<p>前文</p><pre><code class="language-js">const n = 1</code></pre><p>中間</p>${rubyHtml}<p>後文</p>`
    const view = render(<ArticleStructuredHtml html={html} />)
    expect(screen.getByText("前文")).toBeInTheDocument()
    expect(screen.getByText("中間")).toBeInTheDocument()
    expect(screen.getByText("後文")).toBeInTheDocument()
    expect(screen.getByTestId("article-body-html").querySelectorAll("[data-code-block-shell]")).toHaveLength(2)
    expect(screen.queryByTestId("ruby-runner")).not.toBeInTheDocument()

    view.rerender(<ArticleStructuredHtml html={html} enableRubyRunner />)
    expect(screen.getByTestId("ruby-runner")).toHaveTextContent('puts "hello"')
    expect(screen.getByTestId("ruby-runner").getAttribute("data-source-html")).toContain('class="lang-ruby"')
    expect(screen.getByText("中間")).toBeInTheDocument()
  })
})
