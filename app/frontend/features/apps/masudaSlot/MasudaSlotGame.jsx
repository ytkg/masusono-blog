import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { useAppActive } from "../shared/AppActivityContext"
import { BONUS, initialGame, isGameOver, startGame, stopGame, wager } from "./game"
import { REELS, SIZE, SYMBOLS, wrap } from "./reels"
import SlotHelp from "./SlotHelp"
import "./slot.css"

const reelNames = ["左", "中", "右"]

export default function MasudaSlotGame() {
  const [game, setGame] = useState(initialGame)
  const [help, setHelp] = useState(false)
  const [auto, setAuto] = useState(false)
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden)
  const [settling, setSettling] = useState(false)
  const appActive = useAppActive()
  const active = appActive && visible && !help
  const strips = useRef([])
  const phases = useRef([1, 1, 1])
  const paused = !active

  useEffect(() => {
    const changed = () => setVisible(!document.hidden)
    document.addEventListener("visibilitychange", changed)
    return () => document.removeEventListener("visibilitychange", changed)
  }, [])

  useLayoutEffect(() => {
    for (let reel = 0; reel < 3; reel++) {
      const node = strips.current[reel]
      if (!node) continue
      if (game.stops[reel] === -1) {
        phases.current[reel] = wrap(phases.current[reel])
        node.style.transition = "none"
      } else {
        const from = phases.current[reel]
        const position = Math.ceil(from) + wrap(game.stops[reel] - wrap(Math.ceil(from)))
        phases.current[reel] = position
        node.style.transition = "transform 140ms ease-out"
      }
      node.style.transform = `translateY(calc(${-SIZE - phases.current[reel] + 1} * var(--slot-cell)))`
    }
  }, [game.stops])

  useLayoutEffect(() => {
    if (!game.spinning || !active) return
    let cancelled = false
    let frame
    let previous
    function animate(now) {
      if (cancelled) return
      const elapsed = previous === undefined ? 0 : Math.min(now - previous, 50)
      previous = now
      game.stops.forEach((position, reel) => {
        if (position !== -1) return
        phases.current[reel] = wrap(phases.current[reel] + (elapsed * SIZE) / 800)
        strips.current[reel].style.transform =
          `translateY(calc(${-SIZE - phases.current[reel] + 1} * var(--slot-cell)))`
      })
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [game.spinning, game.stops, active])

  useEffect(() => {
    if (!settling) return
    const timer = setTimeout(() => setSettling(false), 160)
    return () => clearTimeout(timer)
  }, [settling, game.stops])

  const start = useCallback(() => {
    if (!active || settling) return
    const rolls = [Math.random(), Math.random()]
    setGame((current) => {
      let index = 0
      return startGame(current, () => rolls[index++])
    })
  }, [active, settling])

  const stop = useCallback(
    (reel) => {
      if (!active || !game.spinning || game.stops[reel] !== -1) return
      const press = wrap(Math.ceil(phases.current[reel]))
      setGame((current) => stopGame(current, reel, press))
      setSettling(true)
    },
    [active, game.spinning, game.stops],
  )

  useEffect(() => {
    function keydown(event) {
      if (
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.target.closest?.("input, textarea, select, a")
      )
        return
      if (event.code === "Space" && !event.target.closest?.("button")) {
        event.preventDefault()
        start()
      }
      const reel = ["Digit1", "Digit2", "Digit3"].indexOf(event.code)
      if (reel !== -1) {
        event.preventDefault()
        stop(reel)
      }
    }
    window.addEventListener("keydown", keydown)
    return () => window.removeEventListener("keydown", keydown)
  }, [start, stop])

  useEffect(() => {
    if (!auto || !game.bonus || !active || settling) return
    const timer = setTimeout(
      () => {
        if (!game.spinning) start()
        else {
          const reel = game.stops.indexOf(-1)
          const press = wrap(Math.ceil(phases.current[reel]))
          setGame((current) => stopGame(current, reel, press))
          setSettling(true)
        }
      },
      game.spinning ? 240 : 400,
    )
    return () => clearTimeout(timer)
  }, [auto, game.bonus, game.spinning, game.stops, active, settling, start])

  useEffect(() => {
    if (!game.bonus) setAuto(false)
  }, [game.bonus])

  const over = isGameOver(game)
  return (
    <section className="masuda-slot" aria-label="増田の野望 スロットゲーム">
      <div className="slot-cabinet">
        <div className="slot-brand">
          <span>MASUDA SLOT</span>
          <strong>増田の野望</strong>
          <span>その一回に、野望を。</span>
        </div>
        <div className="slot-status">
          <div>
            <span>CREDIT</span>
            <strong aria-label={`残高 ${game.balance}ポイント`}>
              {game.balance.toLocaleString()}
              <small> pt</small>
            </strong>
          </div>
          <div>
            <span>{game.bonus ? "BONUS" : "MODE"}</span>
            <strong>{game.bonus || (game.ambition ? "野望タイム" : "通常")}</strong>
          </div>
          <div>
            <span>{game.ambition ? "残りゲーム" : "PAYOUT"}</span>
            <strong>
              {game.ambition || game.lastPayout}
              <small>{game.ambition ? " G" : " pt"}</small>
            </strong>
          </div>
        </div>
        <div className="slot-lamp-row">
          <div
            className={`slot-lamp ${game.pending ? "lit" : ""}`}
            role="status"
            aria-label={game.pending ? "野望ランプ点灯 ボーナス当選" : "野望ランプ消灯"}
          >
            野望！
          </div>
          <span>
            {game.bonus
              ? `1pt掛け・ベル${BONUS[game.bonus].payout}pt / 累計 ${game.bonusPaid} / ${BONUS[game.bonus].limit}pt`
              : game.replay
                ? "REPLAY · 次は賭けなし"
                : "3pt BET · 5 LINES"}
          </span>
        </div>
        <div className="slot-reels" aria-label="リール 横3本・斜め2本が有効">
          {REELS.map((strip, reel) => (
            <div
              className="slot-reel"
              key={reel}
              role="img"
              aria-label={`${reelNames[reel]}リール ${game.stops[reel] === -1 ? "回転中" : [-1, 0, 1].map((row) => SYMBOLS[strip[wrap(game.stops[reel] + row)]]).join("・")}`}
            >
              <div
                className="slot-strip"
                ref={(node) => {
                  strips.current[reel] = node
                }}
              >
                {[...strip, ...strip, ...strip, ...strip].map((symbol, index) => (
                  <div className="slot-symbol" key={index}>
                    <span className={`slot-glyph symbol-${symbol}`}>{SYMBOLS[symbol]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="slot-payline" aria-hidden="true" />
        </div>
        <div className="slot-stops">
          {reelNames.map((name, reel) => (
            <button
              className="slot-stop"
              key={name}
              aria-label={`${name}リール停止`}
              disabled={!active || !game.spinning || game.stops[reel] !== -1}
              onClick={() => stop(reel)}
            >
              <span />
              {name} STOP
            </button>
          ))}
        </div>
        <p className="slot-message" role="status">
          {paused ? "一時停止中" : game.message}
        </p>
        {over ? (
          <div className="slot-over" role="status">
            <strong>GAME OVER</strong>
            <span>野望は、何度でも。</span>
            <button
              className="slot-lever"
              onClick={() => {
                setGame(initialGame())
                setAuto(false)
              }}
            >
              1,000ptでやり直す
            </button>
          </div>
        ) : (
          <div className="slot-play">
            <button className="slot-lever" disabled={!active || game.spinning || settling || auto} onClick={start}>
              ▶ レバー <small>{wager(game)}pt</small>
            </button>
            {game.bonus ? (
              <button className="slot-auto" aria-pressed={auto} onClick={() => setAuto((value) => !value)}>
                {auto ? "オートを解除" : "オート消化"}
              </button>
            ) : (
              <span className="slot-bonus-guide">
                BIG 7・7・7
                <br />
                REG 7・7・BAR
              </span>
            )}
          </div>
        )}
        <div className="slot-footer">
          <span>
            {game.spins} G · BONUS {game.bonusCount}
          </span>
          <button onClick={() => setHelp(true)}>遊び方・配列表</button>
          <span>ゲーム専用pt</span>
        </div>
      </div>
      <SlotHelp open={help} onClose={() => setHelp(false)} />
    </section>
  )
}
