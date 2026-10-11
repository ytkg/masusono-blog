const COOKIE_NAME = "user_id"
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match ? decodeURIComponent(match[2]) : null
  } catch {
    return null
  }
}

function setCookie(name, value, maxAgeSeconds) {
  const secure = location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`
}

export function getUserIdFromCookie() {
  return getCookie(COOKIE_NAME)
}

export function ensureUserIdCookie() {
  try {
    let id = getUserIdFromCookie()
    if (!id) id = crypto.randomUUID()
    setCookie(COOKIE_NAME, id, ONE_YEAR_SECONDS)
    return getUserIdFromCookie() === id ? id : null
  } catch {
    return null
  }
}
