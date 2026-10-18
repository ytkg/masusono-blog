import { render, screen, waitFor } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { expect, it, vi } from "vitest"
import ArticleHtml from "./ArticleHtml"
vi.mock("./ArticleStructuredHtml", () => ({ default: ({ html }) => <div data-testid="structured">{html}</div> }))
it.each([
  '<pre title="a > b"><code class="language-ruby">puts 1</code></pre>',
  '<pre><!-- sample --><code class="language-ruby">puts 1</code></pre>',
  "<pre><code class=language-ruby>puts 1</code></pre>",
])("DOMで認識できるコードを装飾し、SSR初期HTMLは維持する: %s", async (html) => {
  expect(renderToString(<ArticleHtml html={html} />)).not.toContain('data-testid="structured"')
  render(<ArticleHtml html={html} />)
  expect(await screen.findByTestId("structured")).toHaveTextContent(html)
})
it("コードあり/なしの差替えに追従し、言語なしは生HTMLのままにする", async () => {
  const { rerender } = render(<ArticleHtml html={'<pre><code class="ruby">puts 1</code></pre>'} />)
  await screen.findByTestId("structured")
  rerender(<ArticleHtml html="<pre><code>plain</code></pre>" />)
  await waitFor(() => expect(screen.queryByTestId("structured")).not.toBeInTheDocument())
  expect(screen.getByTestId("article-body-html")).toHaveTextContent("plain")
  rerender(<ArticleHtml html={"<pre><code class=language-js>let x = 1</code></pre>"} />)
  await screen.findByTestId("structured")
})
