function formatError(error) {
  return error instanceof Error ? error.message : String(error)
}

export async function runRubyCode(code, { signal } = {}) {
  const abortedResult = () => errorResult("Ruby 実行を中止しました。")
  if (signal?.aborted) return abortedResult()

  if (typeof Worker === "undefined") {
    return errorResult("この環境では Ruby 実行に対応していません。")
  }

  return new Promise((resolve) => {
    let worker
    let finished = false
    const finish = (result) => {
      if (finished) return
      finished = true
      signal?.removeEventListener("abort", abort)
      worker?.terminate()
      resolve(result)
    }
    const abort = () => finish(abortedResult())

    try {
      worker = new Worker(new URL("./rubyCodeRunner.worker.js", import.meta.url), { type: "module" })
      signal?.addEventListener("abort", abort, { once: true })

      worker.addEventListener(
        "message",
        (event) => {
          finish(event.data)
        },
        { once: true },
      )

      worker.addEventListener(
        "messageerror",
        () => {
          finish(errorResult("Ruby 実行結果の受信に失敗しました。"))
        },
        { once: true },
      )

      worker.addEventListener(
        "error",
        (event) => {
          finish(errorResult(formatError(event.error ?? event.message)))
        },
        { once: true },
      )

      worker.postMessage({ code })
    } catch (error) {
      finish(errorResult(formatError(error)))
    }
  })
}

function errorResult(error) {
  return { error, stderr: "", stdout: "" }
}
