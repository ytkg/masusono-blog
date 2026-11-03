import { expect, it } from "vitest"
import { BONUS, drawBonus, drawSmallRole, initialGame, isGameOver, startGame, stopGame, wager } from "./game"
import { SIZE, stopReel, stopTable } from "./reels"

function finish(game, win = true, order = [0, 1, 2]) {
  let next = game
  for (const reel of order) {
    let press = 0
    if (win && next.role !== "none") {
      press = Array.from({ length: SIZE }, (_, index) => index).find((index) => {
        const stops = [...next.stops]
        stops[reel] = stopReel(next.role, stops, reel, index).position
        return stopTable(next.role).get(stops.join(",")).wins > 0
      })
      expect(press).not.toBeUndefined()
    }
    next = stopGame(next, reel, press)
  }
  return next
}
const start = (game, bonus = 0.99, small = 0.99) => {
  const values = [bonus, small]
  let index = 0
  return startGame(game, () => values[index++])
}

it("draws exactly the documented probability intervals", () => {
  expect(drawBonus(0, false)).toBe("BIG")
  expect(drawBonus(1 / 320, false)).toBe("REG")
  expect(drawBonus(1 / 200, false)).toBeNull()
  expect(drawBonus(1 / 50, true)).toBe("REG")
  expect(drawBonus(1 / 30, true)).toBeNull()
  expect(drawSmallRole(0)).toBe("bell")
  expect(drawSmallRole(1 / 6)).toBe("cherry")
  expect(drawSmallRole(1 / 6 + 1 / 64)).toBe("melon")
  expect(drawSmallRole(1 / 6 + 2 / 64)).toBe("replay")
  expect(drawSmallRole(0.99)).toBe("none")
})

it("charges once, blocks double presses, and pays each small role once in arbitrary order", () => {
  for (const [roll, payout] of [
    [0, 8],
    [1 / 6, 2],
    [1 / 6 + 1 / 64, 6],
  ]) {
    const game = start(initialGame(), 0.99, roll)
    expect(game.balance).toBe(997)
    expect(startGame(game)).toBe(game)
    const once = stopGame(game, 2, 0)
    expect(stopGame(once, 2, 1)).toBe(once)
    const result = finish(game, true, [2, 0, 1])
    expect(result.balance).toBe(997 + payout)
    expect(result.lastPayout).toBe(payout)
    expect(stopGame(result, 1, 0)).toBe(result)
  }
})

it("allows a free replay at zero points before game over, and resets to 1000", () => {
  const replay = finish(start({ ...initialGame(), balance: 3 }, 0.99, 0.25))
  expect(replay.balance).toBe(0)
  expect(replay.replay).toBe(true)
  expect(wager(replay)).toBe(0)
  expect(isGameOver(replay)).toBe(false)
  const free = start(replay)
  expect(free.balance).toBe(0)
  const ended = finish(free, false)
  expect(isGameOver(ended)).toBe(true)
  expect(startGame(ended)).toBe(ended)
  expect(initialGame().balance).toBe(1000)
})

it("carries a bonus through small roles, misses and replay without drawing another bonus", () => {
  let game = finish(start(initialGame(), 0, 0))
  expect(game.pending).toBe("BIG")
  expect(game.bonus).toBeNull()
  expect(game.balance).toBe(1005)
  let calls = 0
  game = startGame(game, () => {
    calls++
    return 0.99
  })
  expect(calls).toBe(1)
  expect(game.role).toBe("BIG")
  // These presses deliberately miss 7 on the left while preserving the internal win.
  game = stopGame(game, 0, 4)
  game = stopGame(game, 1, 4)
  game = stopGame(game, 2, 4)
  expect(game.pending).toBe("BIG")
  expect(game.bonus).toBeNull()
  game = finish(startGame(game, () => 0.25))
  expect(game.replay).toBe(true)
  expect(game.pending).toBe("BIG")
  const before = game.balance
  game = finish(startGame(game, () => 0.99))
  expect(game.balance).toBe(before)
  expect(game.bonus).toBe("BIG")
  expect(game.pending).toBeNull()
})

it("ends bonuses by cumulative payout, pays the last spin fully, and restarts ambition each time", () => {
  for (const type of ["BIG", "REG"]) {
    let game = { ...initialGame(), pending: type }
    game = finish(startGame(game, () => 0.99))
    const before = game.balance
    let games = 0
    while (game.bonus) {
      expect(wager(game)).toBe(1)
      game = finish(startGame(game))
      games++
    }
    expect(games).toBe(type === "BIG" ? 38 : 15)
    expect(game.bonusPaid).toBeGreaterThanOrEqual(BONUS[type].limit)
    expect(game.balance - before).toBe(type === "BIG" ? 304 : 105)
    expect(game.ambition).toBe(50)
    game = finish(start({ ...game, ambition: 1 }, 0.025))
    expect(game.bonus).toBe("REG")
    expect(game.ambition).toBe(0)
    while (game.bonus) game = finish(startGame(game))
    expect(game.ambition).toBe(50)
  }
})

it("uses the high probability on the fiftieth spin and normal probability on the next, including replays", () => {
  let game = { ...initialGame(), ambition: 1, replay: true }
  game = finish(start(game))
  expect(game.ambition).toBe(0)
  expect(game.balance).toBe(1000)
  game = start(game, 0.025)
  expect(game.pending).toBeNull()
  const last = start({ ...initialGame(), ambition: 1 }, 0.025)
  expect(last.pending).toBe("REG")
  expect(last.ambition).toBe(0)
})
