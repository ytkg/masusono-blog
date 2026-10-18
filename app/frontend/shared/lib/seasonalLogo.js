import { useSyncExternalStore } from "react"

const COOKIE_NAME = "seasonal_logo_20261018_autumn_health"
const CHANGE_EVENT = "seasonal-logo-change"
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function isEnabled() {
  try {
    return document.cookie.split(";").some((cookie) => cookie.trim() === `${COOKIE_NAME}=on`)
  } catch {
    return false
  }
}

function subscribe(onChange) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("focus", onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("focus", onChange)
  }
}

export function useSeasonalLogo(initialEnabled = false) {
  return useSyncExternalStore(subscribe, isEnabled, () => initialEnabled)
}

export function setSeasonalLogoEnabled(enabled) {
  const secure = location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${COOKIE_NAME}=${enabled ? "on" : "off"}; Max-Age=${ONE_YEAR_SECONDS}; Path=/; SameSite=Lax${secure}`
  if (isEnabled() !== enabled) throw new Error("Logo preference could not be saved")
  window.dispatchEvent(new Event(CHANGE_EVENT))
}
