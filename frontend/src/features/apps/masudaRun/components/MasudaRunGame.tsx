import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import charImgSrc from "@/assets/masuda_run.png"
import obsShortSrc from "@/assets/other1.png"
import obsTallSrc from "@/assets/other2.png"
import { useMasudaRunRankings } from "@/features/apps/masudaRun/hooks/useMasudaRunRankings"
import { useMasudaRunAssets } from "@/features/apps/masudaRun/hooks/useMasudaRunAssets"
import { useMasudaRunInput } from "@/features/apps/masudaRun/hooks/useMasudaRunInput"
import { useMasudaRunLoop } from "@/features/apps/masudaRun/hooks/useMasudaRunLoop"
import { useMasudaRunRestartCooldown } from "@/features/apps/masudaRun/hooks/useMasudaRunRestartCooldown"
import MasudaRunRankings from "@/features/apps/masudaRun/components/MasudaRunRankings"
import { CFG, createInitialWorld, getNow, getStoredHighScore } from "@/features/apps/masudaRun/lib"
import type { GameState, World } from "@/features/apps/masudaRun/lib"

const containerSx = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  width: "100%",
} as const

const headerSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: 1,
  pb: 0.25,
} as const

const scoreTextSx = { fontSize: 16 } as const

const canvasWrapSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  overflow: "hidden",
  width: "100%",
} as const

const canvasStyle: CSSProperties = { width: "100%", height: "auto", display: "block", outline: "none" }

const SCORE_PAD = 5
const BUTTON_LABELS: Record<GameState, string> = {
  ready: "スタート",
  playing: "ジャンプ",
  gameover: "リスタート",
}

export default function MasudaRunGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement | null>(null)
  const scaleRef = useRef(1)
  const reqRef = useRef<number | null>(null)
  const [state, setState] = useState<GameState>("ready")
  const scoreRef = useRef(0)
  const scoreDisplayRef = useRef(0)
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState<number>(() => getStoredHighScore())
  const suppressClickRef = useRef(false)
  const restartReadyAtRef = useRef(0)
  const [restartReadyAt, setRestartReadyAt] = useState(0)
  const { data: rankings, error: rankingsError, isLoading: rankingsLoading } = useMasudaRunRankings()

  const world = useRef<World>(createInitialWorld())

  const imgRef = useRef<HTMLImageElement | null>(null)
  const obsShortRef = useRef<HTMLImageElement | null>(null)
  const obsTallRef = useRef<HTMLImageElement | null>(null)

  useMasudaRunAssets({
    imgRef,
    obsShortRef,
    obsTallRef,
    sources: { player: charImgSrc, short: obsShortSrc, tall: obsTallSrc },
  })

  const startOrRestart = useCallback(() => {
    const now = getNow()
    if (state === "gameover" && now < restartReadyAtRef.current) return
    world.current = createInitialWorld()
    scoreRef.current = 0
    scoreDisplayRef.current = 0
    setScore(0)
    restartReadyAtRef.current = 0
    setRestartReadyAt(0)
    setState("playing")
  }, [state])

  const doJump = useCallback(() => {
    if (state !== "playing") return
    const p = world.current.player
    if (p.jumps < CFG.MAX_JUMPS) {
      p.vy = CFG.JUMP_VY
      p.onGround = false
      p.jumps += 1
      if (p.jumps === 2) p.spin = CFG.SPIN_MS
    }
  }, [state])

  useMasudaRunRestartCooldown(state, restartReadyAt, restartReadyAtRef, setRestartReadyAt)

  const inputHandlers = useMasudaRunInput({ state, canvasRef, startOrRestart, doJump, suppressClickRef })
  const loopRefs = useMemo(
    () => ({
      scoreRef,
      scoreDisplayRef,
      restartReadyAtRef,
      worldRef: world,
      canvasRef,
      canvasWrapRef,
      scaleRef,
      imgRef,
      obsShortRef,
      obsTallRef,
      reqRef,
    }),
    [
      canvasRef,
      canvasWrapRef,
      imgRef,
      obsShortRef,
      obsTallRef,
      reqRef,
      restartReadyAtRef,
      scaleRef,
      scoreDisplayRef,
      scoreRef,
      world,
    ],
  )

  useMasudaRunLoop({
    state,
    high,
    setHigh,
    setScore,
    setState,
    setRestartReadyAt,
    refs: loopRefs,
  })

  const restartCooling = state === "gameover" && restartReadyAt > 0
  const handlePrimaryAction = useCallback(() => {
    if (state === "playing") {
      doJump()
    } else {
      startOrRestart()
    }
  }, [state, doJump, startOrRestart])

  return (
    <Box sx={containerSx}>
      <Box sx={headerSx}>
        <Typography variant="body2" sx={scoreTextSx}>
          スコア {score.toString().padStart(SCORE_PAD, "0")}
        </Typography>
        <Typography variant="body2" sx={scoreTextSx}>
          ハイスコア {Math.max(high, score).toString().padStart(SCORE_PAD, "0")}
        </Typography>
      </Box>
      <Box ref={canvasWrapRef} sx={canvasWrapSx}>
        <canvas
          ref={canvasRef}
          width={CFG.BASE_W}
          height={CFG.BASE_H}
          tabIndex={0}
          style={canvasStyle}
        />
      </Box>
      <Box sx={{ width: "100%" }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disableRipple
          disabled={restartCooling}
          onPointerDown={(e) => {
            e.preventDefault()
            inputHandlers.onPrimaryPointerDown()
            handlePrimaryAction()
          }}
          onClick={(e) => {
            e.preventDefault()
            if (!inputHandlers.onPrimaryClick()) return
            handlePrimaryAction()
          }}
        >
          {BUTTON_LABELS[state]}
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary">
        操作: スペース/↑でジャンプ（タップでジャンプ）。ゲームオーバー時はスペース/タップで再開。
      </Typography>
      <MasudaRunRankings rankings={rankings} isLoading={rankingsLoading} hasError={Boolean(rankingsError)} />
    </Box>
  )
}
