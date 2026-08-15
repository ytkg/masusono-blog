import { useCallback, useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import charImgSrc from "../assets/masuda_run.webp"
import obsShortSrc from "../assets/other1.webp"
import obsTallSrc from "../assets/other2.webp"
import { useMasudaRunAssets } from "../hooks/useMasudaRunAssets"
import { useMasudaRunInput } from "../hooks/useMasudaRunInput"
import { useMasudaRunLoop } from "../hooks/useMasudaRunLoop"
import { useMasudaRunRestartCooldown } from "../hooks/useMasudaRunRestartCooldown"
import MasudaRunRankings from "./MasudaRunRankings"
import { CFG, createInitialWorld, getNow, getStoredHighScore } from "../lib"
import { useAppLoading } from "../../shared/AppsLoadingContext"

const containerSx = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  width: "100%",
  height: "100%",
  minHeight: 0,
}

const headerSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: 1,
  pb: 0.25,
}

const scoreTextSx = { fontSize: 16 }

const canvasWrapSx = {
  width: "100%",
  aspectRatio: `${CFG.BASE_W} / ${CFG.BASE_H}`,
  flex: "0 1 auto",
  minHeight: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}

const canvasFrameSx = {
  width: "fit-content",
  maxWidth: "100%",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  overflow: "hidden",
}

const canvasStyle = { width: "100%", height: "auto", display: "block", outline: "none" }

const SCORE_PAD = 5
const BUTTON_LABELS = Object.freeze({
  ready: "スタート",
  playing: "ジャンプ",
  gameover: "リスタート",
})

export default function MasudaRunGame({ rankings, rankingsLoading, rankingsError, rankingsFetchError, onScoreSubmit }) {
  const registerLoadingTask = useAppLoading()
  const canvasRef = useRef(null)
  const canvasWrapRef = useRef(null)
  const scaleRef = useRef(1)
  const reqRef = useRef(null)
  const [state, setState] = useState("ready")
  const scoreRef = useRef(0)
  const scoreDisplayRef = useRef(0)
  const [score, setScore] = useState(0)
  const [high, setHigh] = useState(() => getStoredHighScore())
  const suppressClickRef = useRef(false)
  const restartReadyAtRef = useRef(0)
  const [restartReadyAt, setRestartReadyAt] = useState(0)
  const roundIdRef = useRef(0)
  const submittedRoundIdRef = useRef(0)
  const rankingsLoadingTaskRef = useRef(null)

  const world = useRef(createInitialWorld())

  const imgRef = useRef(null)
  const obsShortRef = useRef(null)
  const obsTallRef = useRef(null)

  useMasudaRunAssets({
    imgRef,
    obsShortRef,
    obsTallRef,
    sources: { player: charImgSrc, short: obsShortSrc, tall: obsTallSrc },
    registerLoadingTask,
  })

  useEffect(() => {
    if (rankingsLoading && !rankingsLoadingTaskRef.current) {
      let finishLoading
      const task = new Promise((resolve) => {
        finishLoading = resolve
      })
      rankingsLoadingTaskRef.current = finishLoading
      registerLoadingTask?.(task)
    }

    if (!rankingsLoading && rankingsLoadingTaskRef.current) {
      rankingsLoadingTaskRef.current()
      rankingsLoadingTaskRef.current = null
    }
  }, [rankingsLoading, registerLoadingTask])

  const startOrRestart = useCallback(() => {
    const now = getNow()
    if (state === "gameover" && now < restartReadyAtRef.current) return
    world.current = createInitialWorld()
    scoreRef.current = 0
    scoreDisplayRef.current = 0
    setScore(0)
    restartReadyAtRef.current = 0
    setRestartReadyAt(0)
    roundIdRef.current += 1
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

  useEffect(() => {
    if (state !== "gameover") return
    const roundId = roundIdRef.current
    if (submittedRoundIdRef.current === roundId) return

    submittedRoundIdRef.current = roundId
    const finalScore = Math.floor(scoreRef.current)
    if (!onScoreSubmit || finalScore <= 0) return

    onScoreSubmit(finalScore).catch(() => {
      // 登録失敗時はゲーム体験を止めない
    })
  }, [state, onScoreSubmit])

  useMasudaRunRestartCooldown(state, restartReadyAt, restartReadyAtRef, setRestartReadyAt)

  const inputHandlers = useMasudaRunInput({ state, canvasRef, startOrRestart, doJump, suppressClickRef })
  const loopRefs = {
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
  }

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
        <Box sx={canvasFrameSx}>
          <canvas ref={canvasRef} width={CFG.BASE_W} height={CFG.BASE_H} tabIndex={0} style={canvasStyle} />
        </Box>
      </Box>
      <Box sx={{ width: "100%", flexShrink: 0 }}>
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
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
        操作: スペース/↑でジャンプ（タップでジャンプ）。ゲームオーバー時はスペース/タップで再開。
      </Typography>
      <MasudaRunRankings
        rankings={rankings}
        isLoading={rankingsLoading}
        hasError={rankingsError}
        error={rankingsFetchError}
      />
    </Box>
  )
}
