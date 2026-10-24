import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import { ensureUserIdCookie } from "../lib/userId"

export default function MasusonoAd({ placement, refreshKey, active = true }) {
  const [userId, setUserId] = useState(undefined)

  // Cookie changes have no event; recheck each render and update state only when the ID differs.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const currentId = ensureUserIdCookie()
    if (userId !== currentId) {
      setUserId(currentId)
      return
    }
    window.MasusonoAds?.render()
  })

  if (userId === undefined || !active) return null

  return (
    <Box
      key={`${placement}:${userId}:${refreshKey}`}
      data-masusono-ad={placement}
      data-masusono-viewer-id={userId ?? undefined}
      sx={{ mt: 4 }}
    />
  )
}
