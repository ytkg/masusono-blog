import useSWR from "swr"
import { fetchJson } from "../../shared/lib/fetchJson"

const SHOPS_ENDPOINT = "/api/shop/shops.json"

export default function useShops() {
  const { data, error, isLoading } = useSWR(SHOPS_ENDPOINT, fetchJson)
  const shops = Array.isArray(data?.shops) ? data.shops : []

  return {
    shops,
    error,
    isLoading,
  }
}
