import { fireEvent, render, screen } from "@testing-library/react"
import { expect, it, vi } from "vitest"
import ArticleStructuredHtml from "./ArticleStructuredHtml"
import { runRubyCode } from "./runRubyCode"

vi.mock("./runRubyCode", () => ({ runRubyCode: vi.fn(() => new Promise(() => {})) }))

it("埋め込んだRuby UIを再描画で維持し、本文差替えと離脱では実行を中止する", () => {
  const html = '<blockquote><pre><code class="language-ruby">puts :old</code></pre></blockquote>'
  const view = render(<ArticleStructuredHtml html={html} enableRubyRunner />)
  fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))
  const oldSignal = runRubyCode.mock.calls.at(-1)[1].signal
  view.rerender(<ArticleStructuredHtml html={html} enableRubyRunner />)
  expect(oldSignal.aborted).toBe(false)
  expect(screen.getByRole("button", { name: "■ 停止" })).toBeInTheDocument()

  view.rerender(
    <ArticleStructuredHtml
      html={'<ul><li><pre><code class="language-ruby">puts :new</code></pre></li></ul>'}
      enableRubyRunner
    />,
  )
  expect(oldSignal.aborted).toBe(true)
  expect(screen.getByTestId("ruby-code-runner").closest("li")).toBeInTheDocument()
  fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))
  expect(runRubyCode.mock.calls.at(-1)[0]).toBe("puts :new")
  const currentSignal = runRubyCode.mock.calls.at(-1)[1].signal
  view.unmount()
  expect(currentSignal.aborted).toBe(true)
})
