export const HOME_PREFETCH_MODES = Object.freeze(["hover", "mount"])
export const HOME_PREFETCH_CACHE_FOR = Object.freeze(["30s", "5m"])

const HOME_FEED_INTENT_KEY = "home-feed-intent"

// This is deliberately a one-time intent: normal browser back/forward must
// continue to restore the exact history entry the user left.
export function requestHomeFeed() {
  try {
    window.sessionStorage.setItem(HOME_FEED_INTENT_KEY, "1")
  } catch {
    // Navigation still works when storage is unavailable.
  }
}

export function consumeHomeFeedIntent() {
  try {
    const hasIntent = window.sessionStorage.getItem(HOME_FEED_INTENT_KEY) === "1"
    window.sessionStorage.removeItem(HOME_FEED_INTENT_KEY)
    return hasIntent
  } catch {
    return false
  }
}
