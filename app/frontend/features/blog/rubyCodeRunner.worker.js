import { File, OpenFile, PreopenDirectory, WASI } from "@bjorn3/browser_wasi_shim"
import rubyWasmUrl from "@ruby/4.0-wasm-wasi/dist/ruby+stdlib.wasm?url"
import { RubyVM, consolePrinter } from "@ruby/wasm-wasi"

let rubyModulePromise

function rubyModule() {
  rubyModulePromise ??= fetch(rubyWasmUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ruby WASM の読み込みに失敗しました: ${response.status}`)
      }

      return response.arrayBuffer()
    })
    .then((bytes) => WebAssembly.compile(bytes))

  return rubyModulePromise
}

function createWasi() {
  const fds = [
    new OpenFile(new File([])),
    new OpenFile(new File([])),
    new OpenFile(new File([])),
    new PreopenDirectory("/", new Map()),
  ]

  return new WASI([], [], fds, { debug: false })
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error)
}

async function executeRuby(code) {
  let stdout = ""
  let stderr = ""
  const wasi = createWasi()
  const printer = consolePrinter({
    stdout: (text) => {
      stdout += text
    },
    stderr: (text) => {
      stderr += text
    },
  })

  try {
    const { vm } = await RubyVM.instantiateModule({
      module: await rubyModule(),
      wasip1: wasi,
      addToImports: (imports) => {
        printer.addToImports(imports)
      },
      setMemory: (memory) => {
        printer.setMemory(memory)
      },
    })

    vm.eval(code)

    return { stderr, stdout }
  } catch (error) {
    return { error: formatError(error), stderr, stdout }
  }
}

self.addEventListener("message", async (event) => {
  const code = String(event.data?.code ?? "")
  const result = await executeRuby(code)

  self.postMessage(result)
})
