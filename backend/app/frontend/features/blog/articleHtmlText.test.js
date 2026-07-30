import { describe, expect, it } from "vitest"
import { extractTextFromHtml } from "./articleHtmlText"

describe("extractTextFromHtml", () => {
  it("HTMLタグとエンティティをプレーンテキストへ変換する", () => {
    expect(extractTextFromHtml("<p>本文&nbsp;&amp; <strong>続き</strong> &#x1f60a; &#128640;</p>")).toBe(
      "本文 & 続き 😊 🚀",
    )
  })

  it("未知のエンティティは保持し、連続する空白を正規化する", () => {
    expect(extractTextFromHtml("<div>  one\n two &custom; </div>")).toBe("one two &custom;")
  })

  it("空文字は空文字を返す", () => {
    expect(extractTextFromHtml("   ")).toBe("")
  })
})
