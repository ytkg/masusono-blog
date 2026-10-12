const NAVIGATION_PREFETCH_MODES = Object.freeze(["hover", "mount"])
// Show fresh home data for 30 seconds, then reuse it while refreshing for 5 minutes.
const HOME_PREFETCH_CACHE_FOR = Object.freeze(["30s", "5m"])

// Persistent layouts keep links mounted between visits. Re-mount the home link
// when the path changes so its mount prefetch runs again after leaving home.
export function navigationPrefetchKey({ href, currentPath }) {
  return href === "/" ? `${href}:${currentPath}` : href
}

export function navigationPrefetchProps({ href, currentPath, isActive = currentPath === href }) {
  const isHome = href === "/"

  return {
    prefetch: isActive ? false : NAVIGATION_PREFETCH_MODES,
    ...(isHome ? { cacheFor: HOME_PREFETCH_CACHE_FOR } : {}),
  }
}
