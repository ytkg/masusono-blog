import { afterEach, describe, expect, it, vi } from "vitest"
import { runRubyCode } from "./runRubyCode"

describe("runRubyCode", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("Worker非対応環境では案内エラーを返す", async () => {
    vi.stubGlobal("Worker", undefined)

    await expect(runRubyCode("puts :hello")).resolves.toEqual({
      error: "この環境では Ruby 実行に対応していません。",
      stderr: "",
      stdout: "",
    })
  })

  it("Workerの実行結果を返し、Workerを終了する", async () => {
    const worker = createWorker()
    vi.stubGlobal("Worker", workerConstructor(worker))

    const resultPromise = runRubyCode("puts :hello")
    worker.emit("message", { data: { stderr: "", stdout: "hello\n" } })

    await expect(resultPromise).resolves.toEqual({ stderr: "", stdout: "hello\n" })
    expect(worker.postMessage).toHaveBeenCalledWith({ code: "puts :hello" })
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it("Workerエラーをメッセージとして返す", async () => {
    const worker = createWorker()
    vi.stubGlobal("Worker", workerConstructor(worker))

    const resultPromise = runRubyCode("puts :hello")
    worker.emit("error", { error: new Error("worker failed") })

    await expect(resultPromise).resolves.toEqual({ error: "worker failed", stderr: "", stdout: "" })
    expect(worker.terminate).toHaveBeenCalledOnce()
  })
})

function createWorker() {
  const listeners = new Map()

  return {
    addEventListener(type, callback) {
      listeners.set(type, callback)
    },
    emit(type, event) {
      listeners.get(type)?.(event)
    },
    postMessage: vi.fn(),
    terminate: vi.fn(),
  }
}

function workerConstructor(worker) {
  return function WorkerMock() {
    return worker
  }
}

it("returns a result when constructing a Worker fails", async () => {
  vi.stubGlobal("Worker", function () {
    throw new Error("blocked")
  })
  await expect(runRubyCode("puts 1")).resolves.toMatchObject({ error: "blocked" })
  vi.unstubAllGlobals()
})
it("terminates a Worker when sending code fails", async () => {
  const worker = createWorker()
  worker.postMessage.mockImplementation(() => {
    throw new Error("send failed")
  })
  vi.stubGlobal("Worker", workerConstructor(worker))
  await expect(runRubyCode("puts 1")).resolves.toMatchObject({ error: "send failed" })
  expect(worker.terminate).toHaveBeenCalledOnce()
  vi.unstubAllGlobals()
})
it("terminates an unresponsive Worker once after a minute", async () => {
  vi.useFakeTimers()
  const worker = createWorker()
  vi.stubGlobal("Worker", workerConstructor(worker))
  try {
    const pending = runRubyCode("loop {}")
    await vi.advanceTimersByTimeAsync(60_000)
    await expect(pending).resolves.toMatchObject({ error: "Ruby 実行がタイムアウトしました。" })
    worker.emit("message", { data: { stdout: "late" } })
    expect(worker.terminate).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  } finally {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  }
})
