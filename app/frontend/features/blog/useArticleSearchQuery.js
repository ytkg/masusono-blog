import { useEffect, useState } from "react"
import { notifyLocationChange } from "@/shared/lib/locationEvents"

function readInitialQuery() {
  if (typeof window === "undefined") {
    return ""
  }

  return new URLSearchParams(window.location.search).get("q") ?? ""
}

function writeQueryToUrl(query, mode = "replace") {
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
  if (mode === "push") {
    window.history.pushState(window.history.state, "", nextUrl)
  } else {
    window.history.replaceState(window.history.state, "", nextUrl)
  }
  notifyLocationChange()
}

export default function useArticleSearchQuery() {
  const [query, setQuery] = useState(readInitialQuery)

  function replaceQuery(nextQuery) {
    writeQueryToUrl(nextQuery, "replace")
    setQuery(nextQuery)
  }

  function pushQuery(nextQuery) {
    writeQueryToUrl(nextQuery, "push")
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
