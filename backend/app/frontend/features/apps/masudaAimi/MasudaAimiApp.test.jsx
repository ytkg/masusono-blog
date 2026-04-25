import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import MasudaAimiApp from "./MasudaAimiApp"

const postJsonMock = vi.fn()

vi.mock("@/shared/lib/fetchJson", () => ({
  postJson: (...args) => postJsonMock(...args),
}))

vi.mock("../shared/AppsDrawerLauncher", () => ({
  default: ({ title, children, onClose }) => {
    const handleClose = () => onClose?.()

    return (
      <div>
        <button>{title}</button>
        {children}
        <button onClick={handleClose}>閉じる</button>
      </div>
    )
  },
}))

describe("MasudaAimiApp", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn()
    postJsonMock.mockReset()
  })

  afterEach(() => {})

  it("初期表示で増田AI美の挨拶を出す", () => {
    render(<MasudaAimiApp />)

    expect(screen.getByRole("button", { name: "増田AI美" })).toBeInTheDocument()
    expect(screen.getByText("こんにちはー！笑 どうしたん、今日は😳")).toBeInTheDocument()
  })

  it("メッセージ送信後はAPIを叩いて返答を表示する", async () => {
    postJsonMock.mockResolvedValue({
      reply: "えええいいないいなぁ😳 函館とか最高やん！！",
      draft_reply: "函館旅行いいね。何か美味しいもの食べた？",
    })

    render(<MasudaAimiApp />)

    fireEvent.change(screen.getByRole("textbox", { name: "メッセージ入力" }), {
      target: { value: "函館旅行なう！！" },
    })
    fireEvent.click(screen.getByRole("button", { name: "送信" }))

    expect(screen.getByDisplayValue("")).toBeInTheDocument()
    expect(screen.getByText("函館旅行なう！！")).toBeInTheDocument()
    expect(screen.getByTestId("masuda-aimi-typing")).toBeInTheDocument()
    expect(screen.getByText("増田AI美が入力中...")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText("えええいいないいなぁ😳 函館とか最高やん！！")).toBeInTheDocument()
    })
    expect(screen.getByText("draft_reply")).toBeInTheDocument()
    expect(screen.getByText("函館旅行いいね。何か美味しいもの食べた？")).toBeInTheDocument()
    expect(screen.queryByTestId("masuda-aimi-typing")).not.toBeInTheDocument()
    expect(postJsonMock).toHaveBeenCalledTimes(1)
    expect(postJsonMock.mock.calls[0][1]).toMatchObject({ style_strength: "normal" })
  })

  it("閉じて開き直すと会話履歴を初期化する", () => {
    render(<MasudaAimiApp />)

    fireEvent.change(screen.getByRole("textbox", { name: "メッセージ入力" }), {
      target: { value: "元気？" },
    })
    fireEvent.click(screen.getByRole("button", { name: "送信" }))

    expect(screen.getByText("元気？")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }))
    fireEvent.click(screen.getByRole("button", { name: "増田AI美" }))

    expect(screen.queryByText("元気？")).not.toBeInTheDocument()
    expect(screen.queryByTestId("masuda-aimi-typing")).not.toBeInTheDocument()
    expect(screen.getAllByText("こんにちはー！笑 どうしたん、今日は😳")).toHaveLength(1)
  })
})
