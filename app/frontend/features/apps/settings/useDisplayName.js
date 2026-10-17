import { useEffect, useRef, useState } from "react"
import { getUserIdFromCookie } from "@/shared/lib/userId"
import { requestJson, postJson } from "@/shared/lib/fetchJson"

const DEFAULT_NAME = "NO NAME"

export default function useDisplayName({ loadOnMount, registerLoadingTask }) {
  const [name, setName] = useState(DEFAULT_NAME)
  const [draftName, setDraftName] = useState(name)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [inputError, setInputError] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const loadRef = useRef(null)

  useEffect(() => {
    if (!loadOnMount) return

    const userId = getUserIdFromCookie()
    if (!userId) return

    const controller = new AbortController()
    loadRef.current = controller
    const task = requestJson(`/api/app/users/${encodeURIComponent(userId)}.json`, { signal: controller.signal })
      .then((current) => {
        if (controller.signal.aborted) return
        const fetchedName = current?.name?.toString()?.trim() || DEFAULT_NAME
        setName(fetchedName)
        setDraftName(fetchedName)
        setErrorMessage("")
      })
      .catch(() => {
        // 取得失敗時は既存表示を維持する
      })
    registerLoadingTask(task)
    return () => controller.abort()
  }, [loadOnMount, registerLoadingTask])

  const startEditing = () => {
    loadRef.current?.abort()
    setDraftName(name)
    setErrorMessage("")
    setInputError("")
    setIsEditing(true)
  }

  const saveName = async () => {
    setInputError("")
    setErrorMessage("")
    const trimmed = draftName.trim()
    if (trimmed.length === 0) {
      setInputError("表示名を入力してください")
      return
    }

    const userId = getUserIdFromCookie()
    if (!userId) {
      setErrorMessage("ユーザーIDが見つかりません")
      return
    }

    setIsSaving(true)
    setErrorMessage("")

    try {
      await postJson("/api/app/users.json", { name: trimmed, userId })
      setName(trimmed)
      setIsEditing(false)
    } catch (_error) {
      setErrorMessage("表示名の保存に失敗しました")
    } finally {
      setIsSaving(false)
    }
  }

  return { name, draftName, isEditing, isSaving, inputError, errorMessage, startEditing, saveName, setDraftName }
}
