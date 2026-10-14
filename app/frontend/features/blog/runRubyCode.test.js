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

  it("Workerの生成に失敗した場合にエラー結果を返す", async () => {
    vi.stubGlobal("Worker", function WorkerMock() {
      throw new DOMException("worker blocked", "SecurityError")
    })

    await expect(runRubyCode("puts :hello")).resolves.toEqual({
      error: "SecurityError: worker blocked",
      stderr: "",
      stdout: "",
    })
  })

  it("コードの送信に失敗した場合にエラー結果を返し、Workerを終了する", async () => {
    const worker = createWorker()
    worker.postMessage.mockImplementation(() => {
      throw new DOMException("message failed", "DataCloneError")
    })
    vi.stubGlobal("Worker", workerConstructor(worker))

    await expect(runRubyCode("puts :hello")).resolves.toEqual({
      error: "DataCloneError: message failed",
      stderr: "",
      stdout: "",
    })
    expect(worker.terminate).toHaveBeenCalledOnce()
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

  it("中止済みならWorkerを生成しない", async () => {
    const WorkerMock = vi.fn(workerConstructor(createWorker()))
    vi.stubGlobal("Worker", WorkerMock)
    const controller = new AbortController()
    controller.abort()

    await expect(runRubyCode("loop {}", { signal: controller.signal })).resolves.toEqual({
      error: "Ruby 実行を中止しました。",
      stderr: "",
      stdout: "",
    })
    expect(WorkerMock).not.toHaveBeenCalled()
  })

  it("実行中の中止でWorkerを一度だけ終了し、遅い結果を無視する", async () => {
    const worker = createWorker()
    vi.stubGlobal("Worker", workerConstructor(worker))
    const controller = new AbortController()
    const resultPromise = runRubyCode("loop {}", { signal: controller.signal })
    controller.abort()
    worker.emit("message", { data: { stdout: "late", stderr: "" } })
    worker.emit("error", { message: "late error" })

    await expect(resultPromise).resolves.toEqual({
      error: "Ruby 実行を中止しました。",
      stderr: "",
      stdout: "",
    })
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it.each(["message", "messageerror", "error", "postMessage"])("%sで完了したら中止リスナーを解除する", async (type) => {
    const worker = createWorker()
    vi.stubGlobal("Worker", workerConstructor(worker))
    const controller = new AbortController()
    const removeListener = vi.spyOn(controller.signal, "removeEventListener")
    if (type === "postMessage")
      worker.postMessage.mockImplementation(() => {
        throw new Error("send failed")
      })
    const resultPromise = runRubyCode("puts :hello", { signal: controller.signal })
    if (type !== "postMessage") worker.emit(type, { data: { stdout: "hello", stderr: "" }, message: "failed" })
    const result = await resultPromise
    controller.abort()

    expect(removeListener).toHaveBeenCalledWith("abort", expect.any(Function))
    expect(worker.terminate).toHaveBeenCalledOnce()
    if (type === "message") expect(result).toEqual({ stdout: "hello", stderr: "" })
    else expect(result.error).toBeTruthy()
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
