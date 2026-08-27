function buildFallbackErrorMessage(status) {
  return `Request failed with status ${status}`
}

export class ApiError extends Error {
  constructor({ status, code = null, message, requestId = null }) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

async function buildApiError(response) {
  let code = null
  let message = buildFallbackErrorMessage(response.status)
  let requestId = null

  try {
    const payload = await response.json()
    const errorPayload = payload?.error

    if (errorPayload && typeof errorPayload === "object") {
      if (typeof errorPayload.code === "string") code = errorPayload.code
      if (typeof errorPayload.message === "string" && errorPayload.message.trim().length > 0) {
        message = errorPayload.message
      }
      if (typeof errorPayload.request_id === "string") requestId = errorPayload.request_id
    }
  } catch {
    // 非 JSON エラーでは status ベースのフォールバック文言を使う
  }

  return new ApiError({ status: response.status, code, message, requestId })
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    cache: "no-store",
    ...options,
  })

  if (!response.ok) {
    throw await buildApiError(response)
  }

  if (response.status === 204) return null

  return response.json()
}

export function fetchJson(url) {
  return requestJson(url)
}

export function postJson(url, payload, options = {}) {
  return requestJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers ?? {}),
    },
    body: JSON.stringify(payload),
    ...options,
  })
}

export function getApiErrorDisplayMessage(error, fallbackMessage, messagesByCode = {}) {
  const code = typeof error?.code === "string" ? error.code : null
  if (code && Object.prototype.hasOwnProperty.call(messagesByCode, code)) {
    return messagesByCode[code]
  }

  const message = typeof error?.message === "string" ? error.message.trim() : ""
  if (message.length > 0) {
    return message
  }

  return fallbackMessage
}
