import { useEffect, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { useAppLoading } from "../shared/AppsLoadingContext"
import { useAppActive } from "../shared/AppActivityContext"
import { IMAGES, loadImages } from "./assets"
import { DURATION, multiplier, rank } from "./game"
import { useMasudaTatakiGame } from "./useMasudaTatakiGame"
import { FieldGround } from "./TatakiFieldArt"
import MasudaTatakiHole from "./MasudaTatakiHole"

export default function MasudaTatakiGame({ active = true }) {
  const registerLoadingTask = useAppLoading()
  const appActive = useAppActive()
  const [assets, setAssets] = useState("loading")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const loading = loadImages({ signal: controller.signal })
      .then(
        () => {
          if (!controller.signal.aborted) setAssets("ready")
        },
        () => {
          if (!controller.signal.aborted) setAssets("error")
        },
      )
      .finally(() => controller.abort())
    registerLoadingTask(loading)
    return () => {
      controller.abort()
    }
  }, [registerLoadingTask, attempt])

  const { phase, countdown, game, start, tap } = useMasudaTatakiGame(active && appActive)

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
