import { useEffect } from "react"

const initImageRef = (ref, src) => {
  const img = new Image()
  img.src = src
  img.onload = () => {
    ref.current = img
  }
  return () => {
    ref.current = null
  }
}

export const useMasudaRunAssets = ({ imgRef, obsShortRef, obsTallRef, sources }) => {
  useEffect(() => {
    const cleanups = [
      initImageRef(imgRef, sources.player),
      initImageRef(obsShortRef, sources.short),
      initImageRef(obsTallRef, sources.tall),
    ]
    return () => {
      for (const cleanup of cleanups) {
        cleanup()
      }
    }
  }, [imgRef, obsShortRef, obsTallRef, sources.player, sources.short, sources.tall])
}
