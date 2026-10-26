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
  it.each(["hidden", 'hidden="false"', 'hidden="until-found"'])(
    "%sのあるコードは元HTMLの非表示境界を維持する",
    (attribute) => {
      const html = [
        `<pre ${attribute}><code class="language-ruby">puts :hidden_pre</code></pre>`,
        `<pre><code class="language-ruby" ${attribute}>puts :hidden_code</code></pre>`,
        `<pre><code class="language-ruby">puts :visible<span ${attribute}>puts :hidden_child</span></code></pre>`,
        `<section ${attribute}><pre><code class="language-ruby">puts :hidden_ancestor</code></pre></section>`,
      ].join("")
      render(<ArticleStructuredHtml html={html} enableRubyRunner />)
      const body = screen.getByTestId("article-body-html")
      const original = new DOMParser().parseFromString(html, "text/html").body
      expect(body.innerHTML).toBe(original.innerHTML)
      expect(screen.queryByTestId("ruby-runner")).not.toBeInTheDocument()
    },
  )

  it("hiddenを含む本文でも隣の可視コードとaria-hiddenのコードは装飾する", () => {
    render(
      <ArticleStructuredHtml
        enableRubyRunner
        html={
          '<pre hidden><code class="language-ruby">puts :hidden</code></pre><pre><code class="language-ruby">puts :visible</code></pre><pre aria-hidden="true"><code class="language-js">const n = 1</code></pre>'
        }
      />,
    )
    expect(screen.getByTestId("ruby-runner")).toHaveTextContent("puts :visible")
    expect(screen.getByTestId("article-body-html").querySelectorAll("[data-code-block-shell]")).toHaveLength(1)
    expect(screen.getByTestId("article-body-html").querySelector("pre[hidden]")).toHaveTextContent("puts :hidden")
  })

  it("通常のHTMLを本文として表示する", () => {
    render(<ArticleStructuredHtml html="<p>通常の本文</p><blockquote>引用</blockquote>" />)

    expect(screen.getByTestId("article-body-html")).toHaveTextContent("通常の本文引用")
  })

  it.each(["", "<!-- sample -->"])("言語指定付きコードをHTMLコメントの有無によらず装飾する: %s", (comment) => {
    render(
      <ArticleStructuredHtml
        html={`<p>前文</p><pre>${comment}<code class="language-javascript">const value = 1</code></pre>`}
      />,
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

it.each([
  '<pre>前文<code class="language-ruby">puts :ok</code>後文</pre>',
  '<pre><code class="language-ruby">puts :first</code><code class="language-js">const second = 2</code></pre>',
  '<pre id="anchor"><code class="language-ruby">puts :ok</code></pre>',
  '<pre><code class="language-ruby" id="anchor">puts :ok</code></pre>',
  '<pre><code class="language-ruby"><span id="anchor">puts :ok</span></code></pre>',
])("コード以外の本文とアンカーを持つpreを元のDOMで保持する: %s", (html) => {
  render(<ArticleStructuredHtml html={html} enableRubyRunner />)
  expect(screen.getByTestId("article-body-html").innerHTML).toBe(html)
  expect(screen.queryByTestId("ruby-runner")).not.toBeInTheDocument()
})

it("passes br line breaks to the Ruby runner and syntax highlighted code", () => {
  render(
    <ArticleStructuredHtml
      enableRubyRunner
      html={
        '<pre><code class="language-ruby"># comment<br>  puts 1</code></pre><pre><code class="language-js">// comment<br>const n = 1</code></pre>'
      }
    />,
  )
  expect(screen.getByTestId("ruby-runner").textContent).toBe("# comment\n  puts 1")
  const lines = screen.getByTestId("article-body-html").querySelectorAll("pre > code > [data-code-line]")
  expect(lines).toHaveLength(2)
  expect(lines[1]).toHaveTextContent("const n = 1")
})

it.each([
  '<a href="/about" target="_blank" rel="noopener">puts :link</a>',
  '<span><a href="#destination">puts :fragment</a></span>',
  '<a href="">puts :reload</a>',
  '<a name="destination">puts :target</a>',
])("コード内のリンクと名前付きアンカーを元のDOMで保持する: %s", (content) => {
  const html = `<pre><code class="language-ruby">${content}</code></pre>`
  render(
    <ArticleStructuredHtml
      html={`${html}<pre><code class="language-ruby">puts :normal</code></pre>`}
      enableRubyRunner
    />,
  )
  expect(screen.getByTestId("article-body-html").querySelector("pre")?.outerHTML).toBe(html)
  expect(screen.getAllByTestId("ruby-runner")).toHaveLength(1)
  expect(screen.getByTestId("ruby-runner")).toHaveTextContent("puts :normal")
})
