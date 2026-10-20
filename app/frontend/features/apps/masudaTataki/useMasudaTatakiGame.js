import { useEffect, useRef, useState } from "react"
import { advance, DURATION, hit, initialGame } from "./game"

const getTime = () => performance.now()

export function useMasudaTatakiGame(active) {
  const [phase, setPhase] = useState("title")
  const [countdown, setCountdown] = useState(3)
  const [game, setGame] = useState(initialGame)
  const gameRef = useRef(game)
  const startedAt = useRef(0)
  const countdownElapsed = useRef(0)

  useEffect(() => {
    if (!active || phase !== "countdown") return
    const started = performance.now() - countdownElapsed.current
    const timer = window.setInterval(() => {
      const remaining = 3 - Math.floor((performance.now() - started) / 1000)
      setCountdown(Math.max(1, remaining))
      if (remaining <= 0) setPhase("playing")
    }, 50)
    return () => {
      countdownElapsed.current = performance.now() - started
      window.clearInterval(timer)
    }
  }, [active, phase])

  useEffect(() => {
    if (!active || phase !== "playing") return
    const started = performance.now() - gameRef.current.elapsed
    startedAt.current = started
    const timer = window.setInterval(() => {
      const next = advance(gameRef.current, performance.now() - started)
      gameRef.current = next
      setGame(next)
      if (next.elapsed >= DURATION) {
        setPhase("timeup")
      }
    }, 30)
    return () => window.clearInterval(timer)
  }, [active, phase])

  useEffect(() => {
    if (!active || phase !== "timeup") return
    const timer = window.setTimeout(() => setPhase("result"), 1000)
    return () => window.clearTimeout(timer)
  }, [active, phase])

  const start = () => {
    if (!active) return
    const next = initialGame()
    gameRef.current = next
    setGame(next)
    countdownElapsed.current = 0
    setCountdown(3)
    setPhase("countdown")
  }
  const tap = (index) => {
    if (!active || phase !== "playing") return
    // 描画を待たずに更新し、同じフレーム内の連打も一度だけ採点する。
    const current = gameRef.current
    const now = advance(current, getTime() - startedAt.current)
    // An expired character may have been replaced before the next paint.
    const next = now.holes[index] === current.holes[index] ? hit(now, index) : now
    gameRef.current = next
    setGame(next)
  }

  return { phase, countdown, game, start, tap }
}
