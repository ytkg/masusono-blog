import { outcomes, stopReel } from "./reels.js"

export const PAYOUTS = { bell: 8, cherry: 2, melon: 6, replay: 0 }
export const BONUS = { BIG: { payout: 9, limit: 342 }, REG: { payout: 8, limit: 120 } }
export const ROLE_NAMES = {
  none: "ハズレ",
  bell: "ベル",
  cherry: "チェリー",
  melon: "スイカ",
  replay: "リプレイ",
  BIG: "BIG",
  REG: "REG",
}
export const initialGame = () => ({
  balance: 1000,
  pending: null,
  bonus: null,
  ambition: 0,
  replay: false,
  spinning: false,
  role: "none",
  stops: [1, 1, 1],
  spins: 0,
  bonusPaid: 0,
  bonusGames: 0,
  bonusCount: 0,
  lastPayout: 0,
  message: "レバーを押して、野望に火をつけろ。",
})
export const wager = (game) => (game.replay ? 0 : game.bonus ? 1 : 3)
export const isGameOver = (game) => !game.spinning && game.balance < wager(game)

export function drawSmallRole(value) {
  if (value < 1 / 6) return "bell"
  if (value < 1 / 6 + 1 / 64) return "cherry"
  if (value < 1 / 6 + 2 / 64) return "melon"
  if (value < 1 / 6 + 2 / 64 + 1 / 7) return "replay"
  return "none"
}
export function drawBonus(value, ambition) {
  const big = ambition ? 1 / 50 : 1 / 320
  const reg = ambition ? 1 / 75 : 3 / 1600
  return value < big ? "BIG" : value < big + reg ? "REG" : null
}

export function startGame(game, random = Math.random) {
  if (game.spinning || isGameOver(game)) return game
  let pending = game.pending
  let role = "bell"
  let ambition = game.ambition
  if (!game.bonus) {
    if (!pending) pending = drawBonus(random(), ambition > 0)
    role = drawSmallRole(random())
    if (role === "none" && pending) role = pending
    ambition = pending ? 0 : Math.max(0, ambition - 1)
  }
  return {
    ...game,
    balance: game.balance - wager(game),
    replay: false,
    pending,
    role,
    ambition,
    spinning: true,
    stops: [-1, -1, -1],
    spins: game.spins + 1,
    lastPayout: 0,
    message: pending ? "野望！ 7・7・7 または 7・7・BAR を狙え。" : "好きな順番でリールを止めよう。",
  }
}

export function stopGame(game, reel, press) {
  if (!game.spinning || game.stops[reel] !== -1) return game
  const stops = [...game.stops]
  stops[reel] = stopReel(game.role, stops, reel, press).position
  if (stops.includes(-1)) return { ...game, stops }
  const hit = outcomes(stops)[0] || "none"
  const next = { ...game, stops, spinning: false }
  if (hit === "BIG" || hit === "REG") {
    return {
      ...next,
      pending: null,
      bonus: hit,
      bonusPaid: 0,
      bonusGames: 0,
      bonusCount: game.bonusCount + 1,
      message: `${hit} 入賞！ ${hit === "BIG" ? "7・7・7" : "7・7・BAR"}`,
    }
  }
  const payout = game.bonus && hit === "bell" ? BONUS[game.bonus].payout : PAYOUTS[hit] || 0
  next.balance += payout
  next.lastPayout = payout
  next.replay = hit === "replay"
  next.message =
    hit === "none"
      ? "次の一回に、野望を。"
      : hit === "replay"
        ? "リプレイ！ 次は追加の賭けなし。"
        : `${ROLE_NAMES[hit]}！ +${payout}pt`
  if (game.bonus) {
    next.bonusPaid += payout
    next.bonusGames++
    if (next.bonusPaid >= BONUS[game.bonus].limit) {
      next.bonus = null
      next.ambition = 50
      next.message = "野望タイム突入！ 50ゲームのチャンス。"
    }
  } else if (game.pending && hit === "none") next.message = "野望はまだ続く。ボーナスの絵柄を狙おう。"
  return next
}
