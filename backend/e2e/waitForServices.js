const urls = process.argv.slice(2)

if (urls.length === 0) {
  console.error("[waitForServices] no URLs provided")
  process.exit(1)
}

const timeoutMs = 120 * 1000
const intervalMs = 1000

async function waitFor(url) {
  const deadline = Date.now() + timeoutMs

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.status >= 200 && response.status < 400) {
        console.log(`[waitForServices] ready: ${url} (${response.status})`)
        return
      }

      console.log(`[waitForServices] waiting: ${url} (${response.status})`)
    } catch (error) {
      console.log(`[waitForServices] waiting: ${url} (${error.message})`)
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error(`timeout while waiting for ${url}`)
}

;(async () => {
  for (const url of urls) {
    await waitFor(url)
  }
})().catch((error) => {
  console.error(`[waitForServices] ${error.message}`)
  process.exit(1)
})
