import { useEffect, useState } from "react"
import { notifyLocationChange } from "@/shared/lib/locationEvents"

const HISTORY_MODES = Object.freeze({
  push: "push",
  replace: "replace",
})

function readInitialQuery() {
  if (typeof window === "undefined") {
    return ""
  }

  return new URLSearchParams(window.location.search).get("q") ?? ""
}

function writeQueryToUrl(query, mode = HISTORY_MODES.replace) {
  if (typeof window === "undefined") {
    return
  }

  const url = new URL(window.location.href)
  if (query.trim()) {
    url.searchParams.set("q", query)
  } else {
    url.searchParams.delete("q")
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  if (mode === HISTORY_MODES.push) {
    window.history.pushState(window.history.state, "", nextUrl)
  } else {
    window.history.replaceState(window.history.state, "", nextUrl)
  }
  notifyLocationChange()
}

export default function useArticleSearchQuery() {
  const [query, setQuery] = useState(readInitialQuery)

  function replaceQuery(nextQuery) {
    writeQueryToUrl(nextQuery, HISTORY_MODES.replace)
    setQuery(nextQuery)
  }

  function pushQuery(nextQuery) {
    writeQueryToUrl(nextQuery, HISTORY_MODES.push)
    setQuery(nextQuery)
  }

  useEffect(() => {
    function handlePopState() {
      setQuery(readInitialQuery())
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  return [query, replaceQuery, pushQuery]
}
