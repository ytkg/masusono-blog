import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { RubyVM, consolePrinter } from "@ruby/wasm-wasi"
import { WASI } from "@bjorn3/browser_wasi_shim"

vi.mock("@ruby/4.0-wasm-wasi/dist/ruby+stdlib.wasm?url", () => ({ default: "/ruby.wasm" }))
vi.mock("@ruby/wasm-wasi", () => ({ RubyVM: { instantiateModule: vi.fn() }, consolePrinter: vi.fn() }))
vi.mock("@bjorn3/browser_wasi_shim", () => ({
  File: class {
    constructor(data) {
      this.data = data
    }
  },
  OpenFile: class {
    constructor(file) {
      this.file = file
    }
  },
  PreopenDirectory: class {
    constructor(path, entries) {
      this.path = path
      this.entries = entries
    }
  },
  WASI: vi.fn(function () {}),
}))

let worker, execute, evaluate, output, printer, bytes, module

beforeEach(async () => {
  vi.resetModules()
  vi.clearAllMocks()
  worker = { addEventListener: vi.fn(), postMessage: vi.fn() }
  vi.stubGlobal("self", worker)
  bytes = new ArrayBuffer(4)
  module = {}
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => bytes }))
  vi.spyOn(WebAssembly, "compile").mockResolvedValue(module)
  printer = { addToImports: vi.fn(), setMemory: vi.fn() }
  consolePrinter.mockImplementation((callbacks) => {
    output = callbacks
    return printer
  })
  evaluate = vi.fn()
  RubyVM.instantiateModule.mockImplementation(async ({ addToImports, setMemory }) => {
    addToImports({ wasi_snapshot_preview1: {} })
    setMemory({ buffer: bytes })
    return { vm: { eval: evaluate } }
  })
  await import("./rubyCodeRunner.worker")
  expect(worker.addEventListener).toHaveBeenCalledWith("message", expect.any(Function))
  execute = (data) => worker.addEventListener.mock.calls[0][1]({ data })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe("Ruby worker", () => {
  it("WASMと標準入出力を初期化し、複数の出力をまとめて返信する", async () => {
    evaluate.mockImplementation(() => {
      output.stdout("hello")
      output.stdout("\n")
      output.stderr("warning\n")
    })
    await execute({ code: "puts :hello" })
    expect(fetch).toHaveBeenCalledExactlyOnceWith("/ruby.wasm")
    expect(WebAssembly.compile).toHaveBeenCalledWith(bytes)
    const { module: compiled, wasip1 } = RubyVM.instantiateModule.mock.calls[0][0]
    expect(compiled).toBe(module)
    expect(wasip1).toBeInstanceOf(WASI)
    const [, , fds, options] = WASI.mock.calls[0]
    expect(fds.slice(0, 3).map((fd) => fd.file.data)).toEqual([[], [], []])
    expect(fds[3].path).toBe("/")
    expect(fds[3].entries.size).toBe(0)
    expect(options).toEqual({ debug: false })
    expect(printer.addToImports).toHaveBeenCalledWith({ wasi_snapshot_preview1: {} })
    expect(printer.setMemory).toHaveBeenCalledWith({ buffer: bytes })
    expect(evaluate).toHaveBeenCalledWith("puts :hello")
    expect(worker.postMessage).toHaveBeenCalledExactlyOnceWith({ stdout: "hello\n", stderr: "warning\n" })
  })

  it("コンパイルを再利用し、実行ごとにVMと出力を作り直す", async () => {
    evaluate.mockImplementationOnce(() => output.stdout("first"))
    await execute({ code: "first" })
    await execute({ code: "second" })
    expect(fetch).toHaveBeenCalledOnce()
    expect(WebAssembly.compile).toHaveBeenCalledOnce()
    expect(RubyVM.instantiateModule).toHaveBeenCalledTimes(2)
    expect(worker.postMessage).toHaveBeenLastCalledWith({ stdout: "", stderr: "" })
  })

  it.each([
    [undefined, ""],
    [{ code: null }, ""],
    [{ code: 42 }, "42"],
  ])("入力 %j を文字列にする", async (data, code) => {
    await execute(data)
    expect(evaluate).toHaveBeenCalledWith(code)
  })

  it.each([new Error("Ruby failed"), "Ruby failed"])("実行エラーを出力と共に返信する: %s", async (failure) => {
    evaluate.mockImplementation(() => {
      output.stdout("partial")
      output.stderr("trace")
      throw failure
    })
    await execute({ code: "raise" })
    expect(worker.postMessage).toHaveBeenCalledWith({ error: "Ruby failed", stdout: "partial", stderr: "trace" })
  })

  it("HTTPエラーを報告しコンパイルしない", async () => {
    fetch.mockResolvedValue({ ok: false, status: 503 })
    await execute({ code: "puts 1" })
    expect(worker.postMessage).toHaveBeenCalledWith({
      error: "Ruby WASM の読み込みに失敗しました: 503",
      stdout: "",
      stderr: "",
    })
    expect(WebAssembly.compile).not.toHaveBeenCalled()
  })

  it.each(["fetch", "compile", "instantiate"])("%s の失敗をエラー結果として返信する", async (stage) => {
    const failure = new Error(`${stage} failed`)
    if (stage === "fetch") fetch.mockRejectedValue(failure)
    if (stage === "compile") WebAssembly.compile.mockRejectedValue(failure)
    if (stage === "instantiate") RubyVM.instantiateModule.mockRejectedValue(failure)
    await execute({ code: "puts 1" })
    expect(worker.postMessage).toHaveBeenCalledWith({ error: failure.message, stdout: "", stderr: "" })
    expect(evaluate).not.toHaveBeenCalled()
  })
})
