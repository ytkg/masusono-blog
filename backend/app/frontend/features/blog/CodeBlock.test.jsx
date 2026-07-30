import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import CodeBlock, { CodeBlockRunButton } from "./CodeBlock"

describe("CodeBlock", () => {
  const block = {
    code: "const first = 1\nconst second = 2",
    languageLabel: "JavaScript",
    prismLanguage: "javascript",
  }

  it("言語ラベル、行番号、操作スロットを表示する", () => {
    render(<CodeBlock block={block} action={<button type="button">実行する</button>} />)

    const shell = document.querySelector("[data-code-block-shell]")

    expect(shell?.querySelector("[data-code-language-label]")).toHaveTextContent("JavaScript")
    expect(shell?.querySelector('[data-code-language="JavaScript"]')).toHaveTextContent("const first = 1")
    expect(shell?.querySelectorAll(".react-syntax-highlighter-line-number")).toHaveLength(2)
    expect(screen.getByRole("button", { name: "実行する" })).toBeInTheDocument()
  })

  it("実行ボタンの状態を表示し、クリックを通知する", () => {
    const onClick = vi.fn()
    const { rerender } = render(<CodeBlockRunButton disabled={false} isRunning={false} onClick={onClick} />)

    fireEvent.click(screen.getByRole("button", { name: "▶ 実行" }))

    expect(onClick).toHaveBeenCalledOnce()

    rerender(<CodeBlockRunButton disabled isRunning onClick={onClick} />)

    expect(screen.getByRole("button", { name: "実行中" })).toBeDisabled()
  })
})
