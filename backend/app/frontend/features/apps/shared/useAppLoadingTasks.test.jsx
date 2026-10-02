import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import useAppLoadingTasks from "./useAppLoadingTasks"

function deferred() {
  let resolve
  const promise = new Promise((complete) => {
    resolve = complete
  })
  return { promise, resolve }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe("useAppLoadingTasks", () => {
  it("遷移と全タスクの完了後に表示待ちを経て本文を表示する", async () => {
    const task = deferred()
    const { result, rerender } = renderHook(({ entered }) => useAppLoadingTasks(entered), {
      initialProps: { entered: false },
    })
    act(() => result.current.registerLoadingTask(task.promise))
    rerender({ entered: true })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.isContentVisible).toBe(false)

    await act(async () => task.resolve())
    expect(result.current.completedTaskCount).toBe(1)
    act(() => vi.advanceTimersByTime(499))
    expect(result.current.isContentVisible).toBe(false)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.isContentVisible).toBe(true)
  })

  it("失敗したタスクでも起動画面に留まらない", async () => {
    const { result } = renderHook(() => useAppLoadingTasks(true))
    await act(async () => result.current.registerLoadingTask(Promise.reject(new Error("failed"))))
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.isContentVisible).toBe(true)
  })

  it("再オープン前のタスク完了は現在の進捗へ混ざらない", async () => {
    const oldTask = deferred()
    const currentTask = deferred()
    const { result, rerender } = renderHook(({ entered }) => useAppLoadingTasks(entered), {
      initialProps: { entered: false },
    })
    act(() => result.current.registerLoadingTask(oldTask.promise))
    act(() => {
      result.current.resetLoadingTasks()
      result.current.registerLoadingTask(currentTask.promise)
    })
    rerender({ entered: true })
    await act(async () => oldTask.resolve())
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.loadingTaskCount).toBe(1)
    expect(result.current.completedTaskCount).toBe(0)
    expect(result.current.isContentVisible).toBe(false)

    await act(async () => currentTask.resolve())
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.isContentVisible).toBe(true)
  })

  it("閉じると本文を隠し表示待ちのタイマーを解除する", () => {
    const { result, rerender } = renderHook(({ entered }) => useAppLoadingTasks(entered), {
      initialProps: { entered: true },
    })
    rerender({ entered: false })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current.isContentVisible).toBe(false)
  })
})
