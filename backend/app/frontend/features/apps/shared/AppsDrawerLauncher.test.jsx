import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AppsDrawerLauncher from "./AppsDrawerLauncher"

describe("AppsDrawerLauncher", () => {
  it("起動ボタンでドロワーを開き、閉じると子要素を隠す", async () => {
    const onOpen = vi.fn()
    const onClose = vi.fn()

    render(
      <AppsDrawerLauncher title="Numbers" buttonAriaLabel="アプリを開く" onOpen={onOpen} onClose={onClose}>
        <div>現在のデータ</div>
      </AppsDrawerLauncher>,
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
})
