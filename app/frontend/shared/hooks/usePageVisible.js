import { useSyncExternalStore } from "react"

function subscribe(onChange) {
  document.addEventListener("visibilitychange", onChange)
  return () => document.removeEventListener("visibilitychange", onChange)
}

const getSnapshot = () => document.visibilityState !== "hidden"
const getServerSnapshot = () => true

export default function usePageVisible() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
