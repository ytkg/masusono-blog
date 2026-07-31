import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AppsDialogLauncher from "./AppsDialogLauncher"

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
    expect(await screen.findByRole("heading", { name: "Numbers" })).toBeInTheDocument()
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
    await screen.findByRole("heading", { name: "Numbers" })
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
})
