import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import AnonymousSurveyApp from "./AnonymousSurveyApp"
import { buildCableUrl } from "./anonymousSurveyCable"

vi.mock("../shared/AppsDrawerLauncher", () => ({
  default: ({ title, children }) => (
    <section>
      <h1>{title}</h1>
      {children}
    </section>
  ),
}))

class MockWebSocket {
  static OPEN = 1
  static instances = []

  constructor(url) {
    this.url = url
    this.readyState = MockWebSocket.OPEN
    this.sent = []
    this.listeners = {}
    MockWebSocket.instances.push(this)
  }

  addEventListener(type, listener) {
    this.listeners[type] = [...(this.listeners[type] || []), listener]
  }

  removeEventListener(type, listener) {
    this.listeners[type] = (this.listeners[type] || []).filter((current) => current !== listener)
  }

  send(payload) {
    this.sent.push(JSON.parse(payload))
  }

  close() {
    this.readyState = 3
  }

  emit(type, data = {}) {
    for (const listener of this.listeners[type] || []) {
      listener(data)
    }
  }

  receive(packet) {
    this.emit("message", { data: JSON.stringify(packet) })
  }
}

function confirmSubscription(socket) {
  socket.emit("open")
  socket.receive({ type: "confirm_subscription" })
}

function latestSent(socket) {
  return socket.sent[socket.sent.length - 1]
}

async function waitForSocket() {
  await waitFor(() => {
    expect(MockWebSocket.instances[0]).toBeTruthy()
  })
  return MockWebSocket.instances[0]
}

describe("AnonymousSurveyApp", () => {
  beforeEach(() => {
    MockWebSocket.instances = []
    vi.stubGlobal("WebSocket", MockWebSocket)
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ name: "設定太郎" }),
      }),
    )
    window.localStorage.clear()
    document.cookie = "user_id=survey-user; Path=/"
  })

  afterEach(() => {
    vi.useRealTimers()
    document.cookie = "user_id=; Max-Age=0; Path=/"
    vi.unstubAllGlobals()
  })

  it("現在のホストから Action Cable の URL を作る", () => {
    expect(buildCableUrl({ protocol: "https:", host: "example.com" })).toBe("wss://example.com/cable")
    expect(buildCableUrl({ protocol: "http:", host: "localhost:3000" })).toBe("ws://localhost:3000/cable")
  })

  it("表示時に AnonymousSurveyChannel を購読して参加を送る", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)

    await waitFor(() => {
      expect(socket.sent[0]).toEqual({
        command: "subscribe",
        identifier: JSON.stringify({ channel: "AnonymousSurveyChannel" }),
      })
    })
    expect(socket.sent[1]).toEqual({
      command: "message",
      identifier: JSON.stringify({ channel: "AnonymousSurveyChannel" }),
      data: JSON.stringify({
        action: "appear",
        name: "設定太郎",
      }),
    })
    expect(screen.getByText("接続中")).toBeInTheDocument()
  })

  it("参加者一覧を表示する", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [
          { userId: "user-1", name: "表示名太郎", connectionCount: 1 },
          { userId: "user-2", name: "その他花子", connectionCount: 1 },
        ],
        survey: null,
      },
    })

    expect(await screen.findByText("参加者 2")).toBeInTheDocument()
    expect(screen.getByText("表示名太郎（代表）")).toBeInTheDocument()
    expect(screen.getByText("その他花子")).toBeInTheDocument()
  })

  it("参加者一覧で自分と代表を文字で表示する", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [
          { userId: "survey-user", name: "表示名太郎", connectionCount: 1 },
          { userId: "user-2", name: "その他花子", connectionCount: 1 },
        ],
        survey: null,
      },
    })

    expect(await screen.findByText("表示名太郎（あなた・代表）")).toBeInTheDocument()
    expect(screen.getByText("その他花子")).toBeInTheDocument()
  })

  it("スタートでゲームを開始する", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [
          { userId: "survey-user", name: "表示名太郎", connectionCount: 1 },
          { userId: "user-2", name: "その他花子", connectionCount: 1 },
        ],
        survey: null,
      },
    })
    fireEvent.click(await screen.findByRole("button", { name: "スタート" }))

    expect(latestSent(socket)).toEqual({
      command: "message",
      identifier: JSON.stringify({ channel: "AnonymousSurveyChannel" }),
      data: JSON.stringify({
        action: "start_game",
      }),
    })
  })

  it("参加者が2人未満ならスタートボタンを押せない", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [{ userId: "survey-user", name: "表示名太郎", connectionCount: 1 }],
        survey: null,
      },
    })

    expect(await screen.findByRole("button", { name: "スタート" })).toBeDisabled()
  })

  it("最初の参加者以外にはスタートボタンを表示しない", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [
          { userId: "user-1", name: "表示名太郎", connectionCount: 1 },
          { userId: "survey-user", name: "設定太郎", connectionCount: 1 },
        ],
        survey: null,
      },
    })

    expect(await screen.findByText("最初の参加者が開始します")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "スタート" })).not.toBeInTheDocument()
  })

  it("出題者が質問を送る", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [{ userId: "survey-user", name: "表示名太郎", connectionCount: 1 }],
        survey: {
          id: "survey-1",
          question: null,
          phase: "asking",
          round: 1,
          questioner: { userId: "survey-user", name: "表示名太郎" },
          votedCount: 0,
          participantCount: 1,
        },
      },
    })

    expect(await screen.findByText("表示名太郎さんの質問")).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("YES / NO で答えられる質問"), {
      target: { value: "今日は楽しかった？" },
    })
    fireEvent.click(screen.getByRole("button", { name: "出題" }))

    expect(latestSent(socket)).toEqual({
      command: "message",
      identifier: JSON.stringify({ channel: "AnonymousSurveyChannel" }),
      data: JSON.stringify({
        action: "submit_question",
        question: "今日は楽しかった？",
      }),
    })
  })

  it("出題者以外は質問待ちを表示する", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [
          { userId: "survey-user", name: "表示名太郎", connectionCount: 1 },
          { userId: "user-2", name: "その他花子", connectionCount: 1 },
        ],
        survey: {
          id: "survey-1",
          question: null,
          phase: "asking",
          round: 1,
          questioner: { userId: "user-2", name: "その他花子" },
          votedCount: 0,
          participantCount: 2,
        },
      },
    })

    expect(await screen.findByText("その他花子さんの質問")).toBeInTheDocument()
    expect(screen.getByText("出題を待っています")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "出題" })).not.toBeInTheDocument()
  })

  it("投票中は投票数だけを表示し、YES/NO を送信する", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [{ userId: "survey-user", name: "表示名太郎", connectionCount: 1 }],
        survey: {
          id: "survey-2",
          question: "今日は楽しかった？",
          phase: "voting",
          round: 1,
          questioner: { userId: "survey-user", name: "表示名太郎" },
          votedCount: 0,
          participantCount: 1,
        },
      },
    })

    expect(await screen.findByText("今日は楽しかった？")).toBeInTheDocument()
    expect(screen.getByText("回答 0 / 1")).toBeInTheDocument()
    expect(screen.queryByText(/YES 0/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "YES" }))

    expect(latestSent(socket)).toEqual({
      command: "message",
      identifier: JSON.stringify({ channel: "AnonymousSurveyChannel" }),
      data: JSON.stringify({
        action: "vote",
        answer: true,
      }),
    })
    expect(screen.getByRole("button", { name: "結果を見る" })).toBeDisabled()
  })

  it("全員が回答するまでは結果を見るボタンを押せない", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [
          { userId: "survey-user", name: "表示名太郎", connectionCount: 1 },
          { userId: "user-2", name: "その他花子", connectionCount: 1 },
        ],
        survey: {
          id: "survey-2",
          question: "今日は楽しかった？",
          phase: "voting",
          round: 1,
          questioner: { userId: "survey-user", name: "表示名太郎" },
          votedCount: 1,
          participantCount: 2,
        },
      },
    })

    expect(await screen.findByRole("button", { name: "結果を見る" })).toBeDisabled()
  })

  it("全員回答後に結果を見るボタンを押せる", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [
          { userId: "survey-user", name: "表示名太郎", connectionCount: 1 },
          { userId: "user-2", name: "その他花子", connectionCount: 1 },
        ],
        survey: {
          id: "survey-2",
          question: "今日は楽しかった？",
          phase: "voting",
          round: 1,
          questioner: { userId: "survey-user", name: "表示名太郎" },
          votedCount: 2,
          participantCount: 2,
        },
      },
    })

    fireEvent.click(await screen.findByRole("button", { name: "結果を見る" }))

    expect(latestSent(socket)).toEqual({
      command: "message",
      identifier: JSON.stringify({ channel: "AnonymousSurveyChannel" }),
      data: JSON.stringify({
        action: "reveal",
      }),
    })
  })

  it("出題者以外は結果を見るボタンを表示しない", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [
          { userId: "survey-user", name: "表示名太郎", connectionCount: 1 },
          { userId: "user-2", name: "その他花子", connectionCount: 1 },
        ],
        survey: {
          id: "survey-2",
          question: "今日は楽しかった？",
          phase: "voting",
          round: 1,
          questioner: { userId: "user-2", name: "その他花子" },
          votedCount: 0,
          participantCount: 2,
        },
      },
    })

    expect(await screen.findByText("出題者が結果を公開します")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "結果を見る" })).not.toBeInTheDocument()
  })

  it("結果公開後にYES/NO数を表示する", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [],
        survey: {
          id: "survey-1",
          question: "今日は楽しかった？",
          phase: "revealed",
          round: 1,
          questioner: { userId: "survey-user", name: "設定太郎" },
          votedCount: 3,
          participantCount: 3,
          yesCount: 2,
          noCount: 1,
        },
      },
    })

    expect(await screen.findByText("YES 2")).toBeInTheDocument()
    expect(screen.getByText("NO 1")).toBeInTheDocument()
  })

  it("結果公開後に次の出題者へ進める", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [],
        survey: {
          id: "survey-1",
          question: "今日は楽しかった？",
          phase: "revealed",
          round: 1,
          questioner: { userId: "survey-user", name: "設定太郎" },
          votedCount: 1,
          participantCount: 1,
          yesCount: 1,
          noCount: 0,
        },
      },
    })

    fireEvent.click(await screen.findByRole("button", { name: "次の出題者へ" }))

    expect(latestSent(socket)).toEqual({
      command: "message",
      identifier: JSON.stringify({ channel: "AnonymousSurveyChannel" }),
      data: JSON.stringify({
        action: "next_question",
      }),
    })
  })

  it("出題者以外は次の出題者へ進めない", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [],
        survey: {
          id: "survey-1",
          question: "今日は楽しかった？",
          phase: "revealed",
          round: 1,
          questioner: { userId: "user-1", name: "表示名太郎" },
          votedCount: 1,
          participantCount: 1,
          yesCount: 1,
          noCount: 0,
        },
      },
    })

    expect(await screen.findByText("出題者が次へ進めます")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "次の出題者へ" })).not.toBeInTheDocument()
  })

  it("出題者がいない結果表示では次の出題者が自分の出題へ進める", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [{ userId: "survey-user", name: "設定太郎", connectionCount: 1 }],
        survey: {
          id: "survey-1",
          question: "今日は楽しかった？",
          phase: "revealed",
          round: 1,
          questioner: { userId: "user-1", name: "表示名太郎" },
          nextQuestioner: { userId: "survey-user", name: "設定太郎" },
          votedCount: 1,
          participantCount: 1,
          yesCount: 1,
          noCount: 0,
        },
      },
    })

    fireEvent.click(await screen.findByRole("button", { name: "自分の出題へ進む" }))

    expect(latestSent(socket)).toEqual({
      command: "message",
      identifier: JSON.stringify({ channel: "AnonymousSurveyChannel" }),
      data: JSON.stringify({
        action: "next_question",
      }),
    })
  })

  it("出題者がいない結果表示でも次の出題者以外は進めない", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    confirmSubscription(socket)
    socket.receive({
      message: {
        type: "state",
        participants: [
          { userId: "survey-user", name: "設定太郎", connectionCount: 1 },
          { userId: "user-2", name: "その他花子", connectionCount: 1 },
        ],
        survey: {
          id: "survey-1",
          question: "今日は楽しかった？",
          phase: "revealed",
          round: 1,
          questioner: { userId: "user-1", name: "表示名太郎" },
          nextQuestioner: { userId: "user-2", name: "その他花子" },
          votedCount: 2,
          participantCount: 2,
          yesCount: 1,
          noCount: 1,
        },
      },
    })

    expect(await screen.findByText("次の出題者が進めます")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "自分の出題へ進む" })).not.toBeInTheDocument()
  })

  it("購読確定が返らない場合はエラーを表示する", async () => {
    render(<AnonymousSurveyApp />)
    const socket = await waitForSocket()

    vi.useFakeTimers()
    socket.emit("open")
    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByText("エラー")).toBeInTheDocument()
    expect(screen.getByText("アンケートサーバーから応答がありません。backend を再起動してください")).toBeInTheDocument()
  })
})
