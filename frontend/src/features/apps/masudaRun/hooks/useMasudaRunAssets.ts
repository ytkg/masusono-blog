import { useEffect, type MutableRefObject } from "react"

type Params = {
  imgRef: MutableRefObject<HTMLImageElement | null>
  obsShortRef: MutableRefObject<HTMLImageElement | null>
  obsTallRef: MutableRefObject<HTMLImageElement | null>
  sources: {
    player: string
    short: string
    tall: string
  }
}

const initImageRef = (ref: MutableRefObject<HTMLImageElement | null>, src: string) => {
  const img = new Image()
  img.src = src
  img.onload = () => {
    ref.current = img
  }
  return () => {
    ref.current = null
  }
}

export const useMasudaRunAssets = ({ imgRef, obsShortRef, obsTallRef, sources }: Params) => {
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
