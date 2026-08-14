import { useEffect } from "react"

const initImageRef = (ref, src) => {
  const img = new Image()
  const loaded = new Promise((resolve) => {
    img.onload = () => {
      ref.current = img
      resolve()
    }
    img.onerror = resolve
  })
  img.src = src
  const cleanup = () => {
    ref.current = null
  }
  cleanup.loaded = loaded
  return cleanup
}

export const useMasudaRunAssets = ({ imgRef, obsShortRef, obsTallRef, sources, registerLoadingTask }) => {
  useEffect(() => {
    const assets = [
      initImageRef(imgRef, sources.player),
      initImageRef(obsShortRef, sources.short),
      initImageRef(obsTallRef, sources.tall),
    ]
    for (const asset of assets) registerLoadingTask?.(asset.loaded)
    return () => {
      for (const cleanup of assets) {
        cleanup()
      }
    }
  }, [imgRef, obsShortRef, obsTallRef, sources.player, sources.short, sources.tall])
}
