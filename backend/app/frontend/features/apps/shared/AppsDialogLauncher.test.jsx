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

    await waitFor(() => {
      expect(screen.queryByText("現在のデータ")).not.toBeInTheDocument()
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("Escキーと背景クリックでモーダルを閉じる", async () => {
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

    fireEvent.click(screen.getByRole("button", { name: "アプリを開く" }))
    await screen.findByRole("heading", { name: "Numbers" })
    const container = document.querySelector(".MuiDialog-container")
    fireEvent.mouseDown(container)
    fireEvent.click(container)

    await waitFor(() => {
      expect(screen.queryByText("現在のデータ")).not.toBeInTheDocument()
    })
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
