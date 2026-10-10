import { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { useAppLoading } from "../shared/AppsLoadingContext"
import { IMAGES, loadImages } from "./assets"
import { advance, DURATION, hit, initialGame, multiplier, rank } from "./game"
import { FieldGround } from "./TatakiFieldArt"
import MasudaTatakiHole from "./MasudaTatakiHole"

const getTime = () => performance.now()

export default function MasudaTatakiGame({ active = true }) {
  const registerLoadingTask = useAppLoading()
  const [assets, setAssets] = useState("loading")
  const [attempt, setAttempt] = useState(0)
  const [phase, setPhase] = useState("title")
  const [countdown, setCountdown] = useState(3)
  const [game, setGame] = useState(initialGame)
  const gameRef = useRef(game)
  const startedAt = useRef(0)

  useEffect(() => {
    let disposed = false
    const loading = loadImages().then(
      () => {
        if (!disposed) setAssets("ready")
      },
      () => {
        if (!disposed) setAssets("error")
      },
    )
    registerLoadingTask(loading)
    return () => {
      disposed = true
    }
  }, [registerLoadingTask, attempt])

  useEffect(() => {
    if (!active || phase !== "countdown") return
    const started = performance.now()
    const timer = window.setInterval(() => {
      const remaining = 3 - Math.floor((performance.now() - started) / 1000)
      setCountdown(Math.max(1, remaining))
      if (remaining <= 0) setPhase("playing")
    }, 50)
    return () => window.clearInterval(timer)
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
    const next = initialGame()
    gameRef.current = next
    setGame(next)
    setCountdown(3)
    setPhase("countdown")
  }
  const tap = (index) => {
    if (!active || phase !== "playing") return
    // 描画を待たずに更新し、同じフレーム内の連打も一度だけ採点する。
    const now = advance(gameRef.current, getTime() - startedAt.current)
    const next = hit(now, index)
    if (next === now) return
    gameRef.current = next
    setGame(next)
  }

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        width: "100%",
        maxWidth: 460,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        userSelect: "none",
      }}
    >
      {phase === "title" ? (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
            増田たたき
          </Typography>
          <Box
            component="img"
            src={IMAGES[0]}
            alt="増田"
            sx={{
              width: 100,
              height: 100,
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
              mx: "auto",
              mb: 2,
              borderRadius: "50%",
            }}
          />
          <Typography>増田をタップして +100点！</Typography>
          <Typography>その他を叩くと -100点。</Typography>
          <Typography sx={{ mb: 2 }}>30秒間、連続ヒットでコンボ倍率アップ！</Typography>
          {assets === "error" ? (
            <>
              <Typography role="alert">画像を読み込めませんでした。</Typography>
              <Button
                onClick={() => {
                  setAssets("loading")
                  setAttempt(attempt + 1)
                }}
              >
                再読み込み
              </Button>
            </>
          ) : (
            <Button variant="contained" disabled={assets !== "ready"} onClick={start}>
              {assets === "ready" ? "スタート" : "画像を読み込み中…"}
            </Button>
          )}
        </Box>
      ) : phase === "result" ? (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" component="h3">
            結果：{rank(game.score)}ランク
          </Typography>
          <Typography variant="h3" sx={{ my: 2 }}>
            {game.score}点
          </Typography>
          <Typography>最大コンボ：{game.maxCombo}</Typography>
          <Typography>増田ヒット数：{game.hits}</Typography>
          <Typography sx={{ mb: 3 }}>その他誤タップ数：{game.mistakes}</Typography>
          <Button variant="contained" onClick={start}>
            もう一度遊ぶ
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", gap: 1 }}>
            <Typography>残り {Math.ceil((DURATION - game.elapsed) / 1000)}秒</Typography>
            <Typography sx={{ fontWeight: 700 }}>{game.score}点</Typography>
            <Typography
              key={game.combo}
              sx={{ fontWeight: game.combo >= 5 ? 900 : 400, color: game.combo >= 5 ? "success.main" : "text.primary" }}
            >
              {game.combo}コンボ ×{multiplier(game.combo)}
            </Typography>
          </Box>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: "min(460px, calc(100dvh - 230px))",
              my: 2,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0.5,
              p: "6%",
              boxSizing: "border-box",
              isolation: "isolate",
              touchAction: "none",
            }}
          >
            <FieldGround />
            {game.holes.map((character, index) => (
              <MasudaTatakiHole key={index} character={character} index={index} elapsed={game.elapsed} onTap={tap} />
            ))}
            {phase !== "playing" && (
              <Box
                role="status"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "rgba(255,244,218,.6)",
                  zIndex: 4,
                  borderRadius: 3,
                }}
              >
                <Typography variant="h2" sx={{ fontWeight: 900 }}>
                  {phase === "countdown" ? countdown : "TIME UP!"}
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="caption">増田 +100 ／ その他 -100 ／ 連続ヒットで倍率アップ</Typography>
        </>
      )}
    </Box>
  )
}
