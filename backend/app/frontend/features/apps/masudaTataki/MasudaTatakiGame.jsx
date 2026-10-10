import { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { useAppLoading } from "../shared/AppsLoadingContext"
import { IMAGES, loadImages } from "./assets"
import { advance, DURATION, hit, initialGame, multiplier, rank } from "./game"
import { FieldGround, HoleArt } from "./TatakiFieldArt"

const getTime = () => performance.now()
// 顔の大きさと中心を揃え、元写真の透明な余白を調整する。
const PORTRAITS = [
  { width: "100%", left: "4%", top: "-12%" },
  { width: "125%", left: "-17%", top: "2%" },
  { width: "120%", left: "18%", top: "2%" },
]

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
        gap: 1,
        userSelect: "none",
      }}
    >
      {phase === "title" ? (
        <Box sx={{ my: "auto", textAlign: "center" }}>
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
        <Box sx={{ my: "auto", textAlign: "center" }}>
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
              my: { xs: 2, sm: "auto" },
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
              <Box
                component="button"
                type="button"
                key={index}
                aria-label={`穴${index + 1}${character && !character.hit ? (character.kind === "masuda" ? " 増田" : " その他") : ""}`}
                onPointerDown={(event) => {
                  event.preventDefault()
                  tap(index)
                }}
                onClick={(event) => {
                  if (event.detail === 0) tap(index)
                }}
                sx={{
                  position: "relative",
                  aspectRatio: "1",
                  border: 0,
                  borderRadius: 2,
                  background: "transparent",
                  p: 0,
                  overflow: "hidden",
                  cursor: "pointer",
                  touchAction: "none",
                  WebkitTapHighlightColor: "transparent",
                  "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main" },
                  "@keyframes emerge": { from: { transform: "translateY(90%)" }, to: { transform: "translateY(0)" } },
                }}
              >
                <HoleArt />
                {character && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: "0 0 25%",
                      overflow: "hidden",
                      borderRadius: "0 0 20% 20% / 0 0 45% 45%",
                      zIndex: 1,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        animation: "emerge 120ms ease-out",
                        transform: character.hit
                          ? "scaleY(.45) rotate(-10deg)"
                          : character.until - game.elapsed < 120
                            ? "translateY(90%)"
                            : "none",
                        transformOrigin: "bottom",
                        transition: "transform 100ms ease",
                        "@media (prefers-reduced-motion: reduce)": { animation: "none", transition: "none" },
                      }}
                    >
                      <Box
                        component="img"
                        src={IMAGES[character.image]}
                        alt=""
                        draggable={false}
                        sx={{ position: "absolute", height: "auto", maxWidth: "none", ...PORTRAITS[character.image] }}
                      />
                    </Box>
                  </Box>
                )}
                <HoleArt foreground />
                {character?.hit && (
                  <Typography
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 900,
                      fontSize: 24,
                      zIndex: 3,
                      textShadow: "0 1px 2px white",
                      color: character.points > 0 ? "success.main" : "error.main",
                      bgcolor: "transparent",
                    }}
                  >
                    {character.points > 0 ? "+" : ""}
                    {character.points}
                  </Typography>
                )}
              </Box>
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
