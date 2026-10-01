import { useCallback, useEffect, useState } from "react"
import { getUserIdFromCookie } from "@/shared/lib/userId"
import { fetchJson, postJson } from "@/shared/lib/fetchJson"

const DEFAULT_NAME = "NO NAME"

export default function useDisplayName({ loadOnMount, registerLoadingTask }) {
  const [name, setName] = useState(DEFAULT_NAME)
  const [draftName, setDraftName] = useState(name)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [inputError, setInputError] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const loadCurrentUser = useCallback(async () => {
    if (isEditing) return

    const userId = getUserIdFromCookie()
    if (!userId) return

    try {
      const current = await fetchJson(`/api/app/users/${encodeURIComponent(userId)}.json`)
      const fetchedName = current?.name?.toString()?.trim() || DEFAULT_NAME
      setName(fetchedName)
      setDraftName(fetchedName)
      setErrorMessage("")
    } catch (_error) {
      // 取得失敗時は既存表示を維持する
    }
  }, [isEditing])

  useEffect(() => {
    if (!loadOnMount) return

    const task = loadCurrentUser()
    registerLoadingTask(task)
  }, [loadCurrentUser, loadOnMount, registerLoadingTask])

  const startEditing = () => {
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
