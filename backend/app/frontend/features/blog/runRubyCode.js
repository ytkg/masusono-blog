function formatError(error) {
  return error instanceof Error ? error.message : String(error)
}

export async function runRubyCode(code) {
  if (typeof Worker === "undefined") {
    return errorResult("この環境では Ruby 実行に対応していません。")
  }

  return new Promise((resolve) => {
    let worker
    try {
      worker = new Worker(new URL("./rubyCodeRunner.worker.js", import.meta.url), { type: "module" })
    } catch (error) {
      resolve(errorResult(formatError(error)))
      return
    }
    let finished = false
    const timer = setTimeout(() => finish(errorResult("Ruby 実行がタイムアウトしました。")), 60_000)

    const finish = (result) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      worker.terminate()
      resolve(result)
    }

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

    try {
      worker.postMessage({ code })
    } catch (error) {
      finish(errorResult(formatError(error)))
    }
  })
}

function errorResult(error) {
  return { error, stderr: "", stdout: "" }
}
