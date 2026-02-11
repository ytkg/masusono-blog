import { useEffect, useMemo, useState } from "react"
import Button from "@mui/material/Button"

function isIos() {
  if (typeof navigator === "undefined") return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isStandaloneMode() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true
}

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(() => (typeof window !== "undefined" ? isStandaloneMode() : false))
  const isIosDevice = useMemo(() => (typeof window !== "undefined" ? isIos() : false), [])

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  if (installed) return null

  if (isIosDevice) {
    return (
      <Button
        size="small"
        variant="outlined"
        disabled
        sx={{ position: "fixed", right: 12, bottom: { xs: 110, sm: 118 }, zIndex: (theme) => theme.zIndex.tooltip }}
      >
        iOSは共有メニューからホーム画面追加
      </Button>
    )
  }

  if (!deferredPrompt) return null

  const handleInstall = async () => {
    deferredPrompt.prompt()
    try {
      await deferredPrompt.userChoice
    } finally {
      setDeferredPrompt(null)
    }
  }

  return (
    <Button
      size="small"
      variant="contained"
      onClick={handleInstall}
      sx={{ position: "fixed", right: 12, bottom: { xs: 110, sm: 118 }, zIndex: (theme) => theme.zIndex.tooltip }}
    >
      アプリをインストール
    </Button>
  )
}
