import { useEffect } from "react"
import { loadImage } from "../../shared/loadImage"

const noop = () => {}

export const useMasudaRunAssets = ({ imgRef, obsShortRef, obsTallRef, sources, registerLoadingTask = noop }) => {
  useEffect(() => {
    const controller = new AbortController()
    for (const [ref, src] of [
      [imgRef, sources.player],
      [obsShortRef, sources.short],
      [obsTallRef, sources.tall],
    ]) {
      const loaded = loadImage(src, { signal: controller.signal }).then((image) => {
        if (!controller.signal.aborted) ref.current = image
      }, noop)
      registerLoadingTask(loaded)
    }
    return () => {
      controller.abort()
      for (const ref of [imgRef, obsShortRef, obsTallRef]) ref.current = null
    }
  }, [imgRef, obsShortRef, obsTallRef, registerLoadingTask, sources.player, sources.short, sources.tall])
}
