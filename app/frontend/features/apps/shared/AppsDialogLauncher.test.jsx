import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AppsDialogLauncher from "./AppsDialogLauncher"
import { useAppActive } from "./AppActivityContext"

describe("AppsDialogLauncher", () => {
  it("起動ボタンでモーダルを開き、閉じると子要素を隠す", async () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()

    render(
      <AppsDialogLauncher title="Numbers" buttonAriaLabel="アプリを開く" onOpen={onOpen} onClose={onClose}>
        <div>現在のデータ</div>
      </AppsDialogLauncher>,
    )

    expect(screen.queryByText("現在のデータ")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "アプリを開く" }))

    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(await screen.findByRole("heading", { name: "Numbers" }, { timeout: 2_000 })).toBeInTheDocument()
    expect(screen.getByText("現在のデータ")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }))
    expect(screen.getByText("現在のデータ")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText("現在のデータ")).not.toBeInTheDocument()
    })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: "アプリを開く" })).toHaveFocus()
  })

  it("Escキーでモーダルを閉じる", async () => {
    const onClose = vi.fn()

    render(
      <AppsDialogLauncher title="Numbers" buttonAriaLabel="アプリを開く" onClose={onClose}>
        <div>現在のデータ</div>
      </AppsDialogLauncher>,
    )

    fireEvent.click(screen.getByRole("button", { name: "アプリを開く" }))
    await screen.findByRole("heading", { name: "Numbers" }, { timeout: 2_000 })
    fireEvent.keyDown(document.querySelector(".MuiDialog-root"), { key: "Escape" })

    await waitFor(() => {
      expect(screen.queryByText("現在のデータ")).not.toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "アプリを開く" })).toBeInTheDocument()
    })

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("起動アイコンを基点にモーダルを拡大する", async () => {
    render(
      <AppsDialogLauncher title="Numbers" buttonAriaLabel="アプリを開く">
        <div>現在のデータ</div>
      </AppsDialogLauncher>,
    )
    const launcher = screen.getByRole("button", { name: "アプリを開く" })
    launcher.getBoundingClientRect = () => ({ left: 20, top: 30, width: 56, height: 56 })

    fireEvent.click(launcher)

    expect(await screen.findByRole("dialog", { name: "Numbers" })).toBeInTheDocument()
    expect(document.querySelector(".MuiDialog-container")).toHaveStyle({
      position: "fixed",
    })
  })

  it("拡大中は起動アイコンを表示し、完了後にアプリ本体を表示する", async () => {
    render(
      <AppsDialogLauncher title="Numbers" buttonAriaLabel="アプリを開く">
        <div>現在のデータ</div>
      </AppsDialogLauncher>,
    )

    fireEvent.click(screen.getByRole("button", { name: "アプリを開く" }))

    const loadingIndicator = screen.getByRole("status", { name: "Numbersを読み込み中" })
    expect(loadingIndicator).toBeVisible()
    expect(screen.getByTestId("app-content")).not.toBeVisible()

    await waitFor(
      () => {
        expect(screen.getByTestId("app-content")).toBeVisible()
      },
      { timeout: 2_000 },
    )
    expect(loadingIndicator).not.toBeVisible()
  })
})

it.each([false, true])("onOpenのPromiseを待ち、失敗でも表示を続ける: reject=%s", async (reject) => {
  vi.useFakeTimers()
  let settle
  const loading = new Promise((resolve, fail) => {
    settle = () => (reject ? fail(new Error("offline")) : resolve())
  })
  const { unmount } = render(
    <AppsDialogLauncher title="Awaited" buttonAriaLabel="待機アプリ" onOpen={() => loading}>
      <div>読み込み後の内容</div>
    </AppsDialogLauncher>,
  )
  try {
    fireEvent.click(screen.getByRole("button", { name: "待機アプリ" }))
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(screen.getByTestId("app-content")).not.toBeVisible()
    await act(async () => {
      settle()
      await Promise.resolve()
    })
    await act(async () => vi.advanceTimersByTimeAsync(500))
    expect(screen.getByTestId("app-content")).toBeVisible()
  } finally {
    unmount()
    vi.useRealTimers()
  }
})

it("動きを減らす設定では内部の内容・読み込み画面もフェードさせない", () => {
  const originalMatchMedia = window.matchMedia
  window.matchMedia = (query) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })
  const { unmount } = render(
    <AppsDialogLauncher title="Reduced" buttonAriaLabel="低モーション">
      <div>内容</div>
    </AppsDialogLauncher>,
  )
  try {
    fireEvent.click(screen.getByRole("button", { name: "低モーション" }))
    expect(screen.getByTestId("app-content")).toHaveStyle({ transition: "none" })
    expect(screen.getByRole("status", { name: "Reducedを読み込み中" })).toHaveStyle({ transition: "none" })
  } finally {
    unmount()
    window.matchMedia = originalMatchMedia
  }
})

it("ゲームは読込と遷移の完了後だけ有効になり、閉じ始めた時点で停止する", async () => {
  function Activity() {
    return <div data-testid="activity">{String(useAppActive())}</div>
  }
  vi.useFakeTimers()
  let finish
  const loading = new Promise((resolve) => {
    finish = resolve
  })
  const { unmount } = render(
    <AppsDialogLauncher title="Game" buttonAriaLabel="ゲームを開く" onOpen={() => loading}>
      <Activity />
    </AppsDialogLauncher>,
  )
  try {
    fireEvent.click(screen.getByRole("button", { name: "ゲームを開く" }))
    expect(screen.getByTestId("activity")).toHaveTextContent("false")
    expect(screen.getByTestId("app-content")).toHaveAttribute("inert")
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(screen.getByTestId("activity")).toHaveTextContent("false")
    await act(async () => finish())
    await act(async () => vi.advanceTimersByTimeAsync(499))
    expect(screen.getByTestId("activity")).toHaveTextContent("false")
    await act(async () => vi.advanceTimersByTimeAsync(1))
    expect(screen.getByTestId("activity")).toHaveTextContent("true")
    expect(screen.getByTestId("app-content")).not.toHaveAttribute("inert")
    fireEvent.click(screen.getByRole("button", { name: "閉じる" }))
    expect(screen.getByTestId("activity")).toHaveTextContent("false")
    expect(screen.getByTestId("app-content")).toHaveAttribute("inert")
  } finally {
    unmount()
    vi.useRealTimers()
  }
})

it("Paperのカスタムスタイルを実際のdialogへ適用する", () => {
  render(
    <AppsDialogLauncher title="Styled" buttonAriaLabel="スタイル確認" paperSx={{ paddingTop: "7px" }}>
      <div>内容</div>
    </AppsDialogLauncher>,
  )
  fireEvent.click(screen.getByRole("button", { name: "スタイル確認" }))
  expect(screen.getByRole("dialog")).toHaveStyle({ paddingTop: "7px", overflow: "hidden" })
})
