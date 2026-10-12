import { useCallback, useEffect, useRef, useState } from "react"

const COMPLETION_DISPLAY_DURATION = 500

export default function useAppLoadingTasks(isTransitionComplete) {
  const [counts, setCounts] = useState({ total: 0, completed: 0 })
  const [isContentVisible, setIsContentVisible] = useState(false)
  const generationRef = useRef(0)

  const resetLoadingTasks = useCallback(() => {
    generationRef.current += 1
    setCounts({ total: 0, completed: 0 })
    setIsContentVisible(false)
  }, [])

  const registerLoadingTask = useCallback((task) => {
    const generation = generationRef.current
    setCounts((current) => ({ ...current, total: current.total + 1 }))
    Promise.resolve(task)
      .catch(() => {
        // Failed tasks also finish so the loading screen cannot get stuck.
      })
      .finally(() => {
        if (generation !== generationRef.current) return
        setCounts((current) => ({ ...current, completed: current.completed + 1 }))
      })
  }, [])

  const isLoadingComplete = isTransitionComplete && counts.completed === counts.total
  useEffect(() => {
    if (!isLoadingComplete) {
      setIsContentVisible(false)
      return undefined
    }
    const timer = window.setTimeout(() => setIsContentVisible(true), COMPLETION_DISPLAY_DURATION)
    return () => window.clearTimeout(timer)
  }, [isLoadingComplete])

  return {
    registerLoadingTask,
    resetLoadingTasks,
    isContentVisible: isTransitionComplete && isContentVisible,
    loadingTaskCount: counts.total,
    completedTaskCount: counts.completed,
  }
}
