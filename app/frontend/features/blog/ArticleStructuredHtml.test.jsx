import { StrictMode } from "react"
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
  it("引用・リストの親子構造、属性、コード後の本文を維持する", () => {
    render(
      <ArticleStructuredHtml
        html={
          '<blockquote cite="/about"><ol start="3"><li id="step">前文<pre><code class="language-js">const n = 1</code></pre><p>後文</p></li></ol></blockquote>'
        }
      />,
    )
    const quote = screen.getByTestId("article-body-html").querySelector("blockquote")
    expect(quote).toHaveAttribute("cite", "/about")
    expect(quote.querySelector("ol")).toHaveAttribute("start", "3")
    const item = quote.querySelector("#step")
    expect(item.querySelector("[data-code-block-shell]")).toBeInTheDocument()
    expect(item.querySelector("p")).toHaveTextContent("後文")
    expect(item.textContent.indexOf("前文")).toBeLessThan(item.textContent.indexOf("const n = 1"))
    expect(item.textContent.indexOf("const n = 1")).toBeLessThan(item.textContent.indexOf("後文"))
  })

  it("本文に同名のplaceholder属性があってもコードと誤認しない", () => {
    render(
      <ArticleStructuredHtml
        html={
          '<div data-structured-code-block-placeholder="0"></div><pre><code class="language-ruby">puts :ok</code></pre>'
        }
      />,
    )
    expect(screen.getByTestId("article-body-html").querySelectorAll("[data-code-block-shell]")).toHaveLength(1)
  })

  it("StrictModeとHTML差替えでも置換先を維持し、古いコードを残さない", () => {
    const view = render(
      <StrictMode>
        <ArticleStructuredHtml
          enableRubyRunner
          html={'<blockquote><pre><code class="language-ruby">puts :old</code></pre></blockquote>'}
        />
      </StrictMode>,
    )
    expect(screen.getByTestId("ruby-runner").closest("blockquote")).toBeInTheDocument()
    view.rerender(
      <StrictMode>
        <ArticleStructuredHtml
          html={'<ul><li><pre><code class="language-js">const next = 2</code></pre><p>末尾</p></li></ul>'}
        />
      </StrictMode>,
    )
    expect(screen.queryByTestId("ruby-runner")).not.toBeInTheDocument()
    const item = screen.getByTestId("article-body-html").querySelector("li")
    expect(item.querySelector("[data-code-block-shell]")).toHaveTextContent("const next = 2")
    expect(item.querySelector("p")).toHaveTextContent("末尾")
    view.rerender(
      <StrictMode>
        <ArticleStructuredHtml html="<p>コードなし</p>" />
      </StrictMode>,
    )
    expect(screen.queryByText("const next = 2")).not.toBeInTheDocument()
    expect(screen.getByTestId("article-body-html")).toHaveTextContent("コードなし")
    view.unmount()
  })
})
