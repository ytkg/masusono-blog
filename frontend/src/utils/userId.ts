const COOKIE_NAME = "user_id"
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`
}

export function ensureUserIdCookie(): string {
  let id = getCookie(COOKIE_NAME)
  if (!id) {
    id = crypto.randomUUID()
  }
  setCookie(COOKIE_NAME, id, ONE_YEAR_SECONDS)
  return id
}
