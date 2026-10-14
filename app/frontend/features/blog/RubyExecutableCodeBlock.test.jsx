import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import RubyExecutableCodeBlock from "./RubyExecutableCodeBlock"
import { runRubyCode } from "./runRubyCode"

vi.mock("./runRubyCode", () => ({
  runRubyCode: vi.fn(),
}))

describe("RubyExecutableCodeBlock", () => {
  it("通常コードブロック表示を保ったままRubyを実行する", async () => {
    vi.mocked(runRubyCode).mockResolvedValue({ stdout: "hello\nworld\n", stderr: "" })

    render(
      <RubyExecutableCodeBlock
        code={"puts :hello\nputs :world"}
        html={'<pre><code class="language-ruby">puts :hello\nputs :world</code></pre>'}
      />,
    )

    const pre = document.querySelector('[data-testid="ruby-code-runner"] pre')
    const shell = pre?.closest("[data-code-block-shell]")
    expect(pre?.querySelector('[data-code-language="Ruby"]')).toBeInTheDocument()
    expect(shell?.querySelectorAll(".react-syntax-highlighter-line-number")).toHaveLength(2)

    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))

    await waitFor(() => {
      expect(runRubyCode).toHaveBeenCalledWith("puts :hello\nputs :world", { signal: expect.any(AbortSignal) })
    })
    expect(await screen.findByTestId("ruby-code-runner-output")).toHaveTextContent("hello world")
  })

  it("実行結果が長い場合に出力欄をスクロールできる", async () => {
    vi.mocked(runRubyCode).mockResolvedValue({ stdout: `${Array(100).fill("h").join("\n")}\n`, stderr: "" })

    render(
      <RubyExecutableCodeBlock
        code="100.times { p :h }"
        html={'<pre><code class="language-ruby">100.times { p :h }</code></pre>'}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))

    const output = await screen.findByTestId("ruby-code-runner-output")
    const style = window.getComputedStyle(output)
    expect(style.maxHeight).toBe(`${8.5 * Number.parseFloat(style.fontSize)}px`)
    expect(output).toHaveStyle({ overflow: "auto" })
  })

  it("実行エラーを表示する", async () => {
    vi.mocked(runRubyCode).mockResolvedValue({ error: "boom", stdout: "", stderr: "" })

    render(
      <RubyExecutableCodeBlock
        code="raise 'boom'"
        html={"<pre><code class=\"language-ruby\">raise 'boom'</code></pre>"}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))

    expect(await screen.findByRole("alert")).toBeInTheDocument()
    expect(screen.getByText("boom")).toBeInTheDocument()
  })

  it("表示を閉じたら実行を中止する", () => {
    vi.mocked(runRubyCode).mockReturnValue(new Promise(() => {}))
    const { unmount } = render(
      <RubyExecutableCodeBlock code="loop {}" html={'<pre><code class="language-ruby">loop {}</code></pre>'} />,
    )
    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))
    const options = vi.mocked(runRubyCode).mock.calls.at(-1)[1]
    unmount()
    expect(options?.signal.aborted).toBe(true)
  })

  it("実行済みコードが変わったら以前の出力を消す", async () => {
    vi.mocked(runRubyCode).mockResolvedValueOnce({ stdout: "old", stderr: "" })
    const { rerender } = render(
      <RubyExecutableCodeBlock code="puts :old" html={'<pre><code class="language-ruby">puts :old</code></pre>'} />,
    )
    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))
    expect(await screen.findByTestId("ruby-code-runner-output")).toHaveTextContent("old")
    rerender(
      <RubyExecutableCodeBlock code="puts :new" html={'<pre><code class="language-ruby">puts :new</code></pre>'} />,
    )
    expect(screen.queryByTestId("ruby-code-runner-output")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "▶ 実行" })).toBeEnabled()
  })

  it("コード変更で古い実行を中止し、遅い結果に上書きされず新しいコードを実行できる", async () => {
    let finishOldRun
    vi.mocked(runRubyCode).mockReturnValueOnce(
      new Promise((resolve) => {
        finishOldRun = resolve
      }),
    )
    const { rerender } = render(
      <RubyExecutableCodeBlock code="loop {}" html={'<pre><code class="language-ruby">loop {}</code></pre>'} />,
    )
    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))
    const oldOptions = vi.mocked(runRubyCode).mock.calls.at(-1)[1]
    rerender(
      <RubyExecutableCodeBlock code="puts :new" html={'<pre><code class="language-ruby">puts :new</code></pre>'} />,
    )
    expect(oldOptions?.signal.aborted).toBe(true)
    expect(screen.getByRole("button", { name: "▶ 実行" })).toBeEnabled()

    vi.mocked(runRubyCode).mockResolvedValueOnce({ stdout: "new", stderr: "" })
    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))
    expect(await screen.findByTestId("ruby-code-runner-output")).toHaveTextContent("new")
    await act(async () => {
      finishOldRun({ stdout: "old", stderr: "" })
    })
    expect(screen.getByTestId("ruby-code-runner-output")).toHaveTextContent("new")
  })
})
