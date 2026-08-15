import { useEffect } from "react"

const noop = () => {}

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
  const dispose = () => {
    ref.current = null
  }
  return { loaded, dispose }
}

export const useMasudaRunAssets = ({ imgRef, obsShortRef, obsTallRef, sources, registerLoadingTask = noop }) => {
  useEffect(() => {
    const assets = [
      initImageRef(imgRef, sources.player),
      initImageRef(obsShortRef, sources.short),
      initImageRef(obsTallRef, sources.tall),
    ]
    for (const asset of assets) registerLoadingTask(asset.loaded)
    return () => {
      for (const asset of assets) {
        asset.dispose()
      }
    }
  }, [imgRef, obsShortRef, obsTallRef, registerLoadingTask, sources.player, sources.short, sources.tall])
}
