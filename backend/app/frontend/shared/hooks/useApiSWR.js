import useSWR from "swr"
import { fetchJson } from "../lib/fetchJson"

export default function useApiSWR(endpoint, enabled) {
  return useSWR(enabled ? endpoint : null, fetchJson)
}
