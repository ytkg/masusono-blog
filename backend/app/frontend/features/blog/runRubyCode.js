function formatError(error) {
  return error instanceof Error ? error.message : String(error)
}

export async function runRubyCode(code) {
  if (typeof Worker === "undefined") {
    return { error: "この環境では Ruby 実行に対応していません。", stderr: "", stdout: "" }
  }

  return new Promise((resolve) => {
    const worker = new Worker(new URL("./rubyCodeRunner.worker.js", import.meta.url), { type: "module" })

    const finish = (result) => {
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
        finish({ error: "Ruby 実行結果の受信に失敗しました。", stderr: "", stdout: "" })
      },
      { once: true },
    )

    worker.addEventListener(
      "error",
      (event) => {
        finish({ error: formatError(event.error ?? event.message), stderr: "", stdout: "" })
      },
      { once: true },
    )

    worker.postMessage({ code })
  })
}
