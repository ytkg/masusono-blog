import { initialGame, isGameOver, startGame, stopGame } from "../app/frontend/features/apps/masudaSlot/game.js"
import { outcomes, SIZE, stopReel, stopTable, wrap } from "../app/frontend/features/apps/masudaSlot/reels.js"

let seed = 816
const random = () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
  return seed / 4294967296
}
const idealCache = new Map()
function idealPress(game, reel) {
  const key = `${game.role}:${game.stops}:${reel}`
  if (idealCache.has(key)) return idealCache.get(key)
  let best = 0
  let wins = -1
  for (let press = 0; press < SIZE; press++) {
    const positions = [...game.stops]
    positions[reel] = stopReel(game.role, positions, reel, press).position
    const count = stopTable(game.role).get(positions.join(",")).wins
    if (count > wins) {
      wins = count
      best = press
    }
  }
  idealCache.set(key, best)
  return best
}
function pressFor(game, reel, model) {
  if (model === "ideal") return idealPress(game, reel)
  if (game.bonus || model === "random") return Math.floor(random() * SIZE)
  // No internal-role knowledge: alternate cherry/melon targets outside pending,
  // aim at the second seven on all reels after the public lamp lights up.
  const aims = game.pending ? [10, 8, random() < 0.5 ? 8 : 12] : [random() < 0.75 ? 8 : 1, 3, 5]
  const error = random() < 0.75 ? 0 : Math.floor(random() * 7) - 3
  return wrap(aims[reel] + error)
}
const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length
const percentile = (values, fraction) => [...values].sort((a, b) => a - b)[Math.floor((values.length - 1) * fraction)]
const results = []
for (const model of ["random", "aimed", "ideal"]) {
  const end = [],
    after500 = [],
    lows = [],
    drops = []
  let bankrupt = 0,
    wins = 0,
    games = 0,
    pendingGames = 0,
    bigGames = 0,
    regGames = 0
  let bigCount = 0,
    regCount = 0,
    bigNet = 0,
    regNet = 0
  const states = { normal: 0, pending: 0, bonus: 0, ambition: 0 }
  const smallDraws = { cherry: 0, melon: 0 },
    smallHits = { cherry: 0, melon: 0 }
  for (let session = 0; session < 2000; session++) {
    let game = initialGame(),
      low = 1000,
      peak = 1000,
      drop = 0,
      bonusStart = 0,
      bonusLength = 0
    for (let spin = 0; spin < 5000; spin++) {
      if (isGameOver(game)) break
      const state = game.bonus ? "bonus" : game.pending ? "pending" : game.ambition ? "ambition" : "normal"
      states[state]++
      const bonusBefore = game.bonus
      if (bonusBefore) bonusLength++
      game = startGame(game, random)
      if (game.pending) pendingGames++
      if (game.role in smallDraws) smallDraws[game.role]++
      // Fixed push order; exhaustive unit tests separately cover every order.
      for (const reel of [0, 1, 2]) game = stopGame(game, reel, pressFor(game, reel, model))
      const hit = outcomes(game.stops)[0]
      if (hit in smallHits) smallHits[hit]++
      if (!bonusBefore && game.bonus) {
        bonusStart = game.balance
        bonusLength = 0
      }
      if (bonusBefore && !game.bonus) {
        if (bonusBefore === "BIG") {
          bigCount++
          bigGames += bonusLength
          bigNet += game.balance - bonusStart
        } else {
          regCount++
          regGames += bonusLength
          regNet += game.balance - bonusStart
        }
      }
      games++
      low = Math.min(low, game.balance)
      peak = Math.max(peak, game.balance)
      drop = Math.max(drop, peak - game.balance)
      if (spin === 499) after500.push(game.balance - 1000)
    }
    if (game.spins < 500) after500.push(game.balance - 1000)
    end.push(game.balance - 1000)
    lows.push(low)
    drops.push(drop)
    if (isGameOver(game)) bankrupt++
    if (game.balance > 1000) wins++
  }
  results.push({
    model,
    sessions: end.length,
    maxGames: 5000,
    averageProfit: average(end),
    profitP10: percentile(end, 0.1),
    profitMedian: percentile(end, 0.5),
    profitP90: percentile(end, 0.9),
    average500Profit: average(after500),
    loss500Over500Percent: (after500.filter((x) => x <= -500).length / after500.length) * 100,
    bankruptPercent: (bankrupt / end.length) * 100,
    profitablePercent: (wins / end.length) * 100,
    minimumCreditP10: percentile(lows, 0.1),
    drawdownP90: percentile(drops, 0.9),
    averagePendingGamesPerBonus: pendingGames / (bigCount + regCount),
    bigAverageGames: bigGames / bigCount,
    bigAverageNet: bigNet / bigCount,
    regAverageGames: regGames / regCount,
    regAverageNet: regNet / regCount,
    cherryCollectedPercent: (smallHits.cherry / smallDraws.cherry) * 100,
    melonCollectedPercent: (smallHits.melon / smallDraws.melon) * 100,
    states,
    games,
  })
}
console.log(JSON.stringify({ seed: 816, results }, null, 2))
