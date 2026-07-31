// Inertia persists remembered state asynchronously. Keep the current browser
// history entry in sync as well, so a quick mobile back navigation can restore
// the state that was visible immediately before the transition.
export function rememberInCurrentHistoryEntry(key, value) {
  if (typeof window === "undefined" || !window.history.state?.page) return

  const currentState = window.history.state
  window.history.replaceState(
    {
      ...currentState,
      page: {
        ...currentState.page,
        rememberedState: {
          ...currentState.page.rememberedState,
          [key]: value,
        },
      },
    },
    "",
    window.location.href,
  )
}
