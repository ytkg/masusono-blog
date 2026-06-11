import { fireEvent, render, screen, waitFor } from "@testing-library/react"
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

    const pre = screen.getByText(":hello").closest("pre")
    expect(pre).toHaveAttribute("data-code-language", "Ruby")
    expect(pre.querySelectorAll("[data-code-line-number]")).toHaveLength(2)

    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))

    await waitFor(() => {
      expect(runRubyCode).toHaveBeenCalledWith("puts :hello\nputs :world")
    })
    expect(await screen.findByTestId("ruby-code-runner-output")).toHaveTextContent("hello world")
  })

  it("実行結果が長い場合に出力欄をスクロールできる", async () => {
    vi.mocked(runRubyCode).mockResolvedValue({ stdout: `${Array(100).fill("h").join("\n")}\n`, stderr: "" })

    render(<RubyExecutableCodeBlock code="100.times { p :h }" html={'<pre><code class="language-ruby">100.times { p :h }</code></pre>'} />)

    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))

    const output = await screen.findByTestId("ruby-code-runner-output")
    expect(output).toHaveStyle({ maxHeight: "8.5em", overflow: "auto" })
  })

  it("実行エラーを表示する", async () => {
    vi.mocked(runRubyCode).mockResolvedValue({ error: "boom", stdout: "", stderr: "" })

    render(<RubyExecutableCodeBlock code="raise 'boom'" html={'<pre><code class="language-ruby">raise \'boom\'</code></pre>'} />)

    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))

    expect(await screen.findByText("エラー")).toBeInTheDocument()
    expect(screen.getByText("boom")).toBeInTheDocument()
  })
})
