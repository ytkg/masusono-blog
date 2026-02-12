import useSWR from "swr"

const SHOPS_ENDPOINT = "/api/shop/shops.json"

const fetcher = async (url) => {
  const response = await fetch(url, { headers: { Accept: "application/json" } })
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`)
  }
  return response.json()
}

export default function useShops() {
  const { data, error, isLoading } = useSWR(SHOPS_ENDPOINT, fetcher)
  const shops = Array.isArray(data?.shops) ? data.shops : []

  return {
    shops,
    error,
    isLoading,
  }
}
