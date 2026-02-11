import { useEffect, useState } from "react"
import { fetchJson } from "../../../shared/fetchJson"

export function useMetrics() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    fetchJson("/metrics.json")
      .then((json) => {
        if (!mounted) return
        setData(json)
        setError(null)
      })
      .catch((err) => {
        if (!mounted) return
        setError(err)
      })
      .finally(() => {
        if (!mounted) return
        setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return { data, error, isLoading }
}
