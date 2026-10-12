import { usePage } from "@inertiajs/react"

export default function useCurrentPathSegmentId() {
  const { url } = usePage()
  const path = url.split("?")[0].replace(/\/+$/, "")
  const rawSegment = path.split("/").pop() ?? ""

  try {
    return decodeURIComponent(rawSegment)
  } catch {
    return rawSegment
  }
}
