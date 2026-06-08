export const LOCATION_CHANGE_EVENT = "app-location-change"

export function currentLocationPath() {
  if (typeof window === "undefined") {
    return "/"
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

export function notifyLocationChange() {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT))
}
