import { useEffect, useState } from "react"
import { getWebPushState, subscribeToWebPush, unsubscribeFromWebPush } from "./webPush"

export default function useWebPushSettings({ loadOnMount, registerLoadingTask }) {
  const [webPushState, setWebPushState] = useState({ supported: true, subscribed: false, permission: "default" })
  const [isUpdatingWebPush, setIsUpdatingWebPush] = useState(false)
  const [webPushError, setWebPushError] = useState("")

  useEffect(() => {
    if (!loadOnMount) return

    const task = getWebPushState()
      .then(setWebPushState)
      .catch(() => {
        setWebPushState({ supported: false, subscribed: false, permission: "unsupported" })
      })
    registerLoadingTask(task)
  }, [loadOnMount, registerLoadingTask])

  const updateWebPush = async (operation) => {
    setIsUpdatingWebPush(true)
    setWebPushError("")
    try {
      setWebPushState(await operation())
    } catch (_error) {
      setWebPushError("通知設定の更新に失敗しました")
    } finally {
      setIsUpdatingWebPush(false)
    }
  }

  return {
    state: webPushState,
    isSaving: isUpdatingWebPush,
    errorMessage: webPushError,
    subscribe: () => updateWebPush(subscribeToWebPush),
    unsubscribe: () => updateWebPush(unsubscribeFromWebPush),
  }
}
