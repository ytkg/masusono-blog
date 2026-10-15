import { act, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AppsLoadingProvider } from "../shared/AppsLoadingContext"
import MasudaTatakiGame from "./MasudaTatakiGame"

let images, tasks, register
beforeEach(() => {
  images = []
  tasks = []
  register = (task) => tasks.push(task)
  vi.stubGlobal(
    "Image",
    class {
      constructor() {
        images.push(this)
      }
    },
  )
})
afterEach(() => vi.unstubAllGlobals())

function renderGame() {
  return render(
    <AppsLoadingProvider value={register}>
      <MasudaTatakiGame />
    </AppsLoadingProvider>,
  )
}

describe("たたきと画像ローダーの寿命", () => {
  it("unmountで画像イベントを解除してランチャーの待機も終了する", async () => {
    const { unmount } = renderGame()
    expect(screen.getByRole("button", { name: "画像を読み込み中…" })).toBeDisabled()
    unmount()
    expect(images.every((image) => image.onload === null && image.onerror === null)).toBe(true)
    await Promise.all(tasks)
  })

  it("1画像の失敗で残りの画像を解放し、再読込では古い成功を無視する", async () => {
    renderGame()
    const staleLoad = images[1].onload
    await act(async () => {
      images[0].onerror()
      await Promise.all(tasks)
    })
    expect(screen.getByRole("alert")).toHaveTextContent("画像を読み込めませんでした")
    expect(images.every((image) => image.onload === null && image.onerror === null)).toBe(true)
    fireEvent.click(screen.getByRole("button", { name: "再読み込み" }))
    await act(async () => staleLoad())
    expect(screen.getByRole("button", { name: "画像を読み込み中…" })).toBeDisabled()
    await act(async () => {
      images.slice(3).forEach((image) => image.onload())
      await Promise.all(tasks)
    })
    expect(screen.getByRole("button", { name: "スタート" })).toBeEnabled()
  })
})
