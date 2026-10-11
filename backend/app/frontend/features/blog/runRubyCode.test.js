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
