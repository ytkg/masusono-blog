import { useEffect, useState } from "react"
import { fetchJson } from "../../../../shared/fetchJson"

const RANKINGS_URL = "/masuda_run/rankings.json"

export function useMasudaRunRankings() {
  const [data, setData] = useState(undefined)
  const [error, setError] = useState(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    setIsLoading(true)
    fetchJson(RANKINGS_URL)
      .then((json) => {
        if (!mounted) return
        setData(json)
        setError(undefined)
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
