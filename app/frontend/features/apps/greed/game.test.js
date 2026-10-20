import { beforeEach, describe, expect, it } from "vitest"
import {
  PRODUCTS,
  total,
  cpuCart,
  probabilities,
  pickPayer,
  match,
  winners,
  reducer,
  advance,
  readBest,
  saveBest,
  BEST_KEY,
} from "./game"
function seeded(seed = 733) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0
    return seed / 2 ** 32
  }
}
beforeEach(() => localStorage.clear())
describe("greed rules", () => {
  it("has 30 fixed products and real CPU baskets within both ranges", () => {
    expect(PRODUCTS).toHaveLength(30)
    const random = seeded()
    for (const [min, max] of [
      [1000, 3000],
      [4000, 8000],
    ]) {
      for (let i = 0; i < 1000; i++) {
        const cart = cpuCart(min, max, random)
        expect(total(cart)).toBeGreaterThanOrEqual(min)
        expect(total(cart)).toBeLessThanOrEqual(max)
        expect(cart.every(Number.isInteger)).toBe(true)
      }
    }
  })
  it("matches the published probability examples and symmetry", () => {
    for (const [x, expected] of [
      [2000, 90.90909],
      [6000, 52.63158],
      [10000, 28.57143],
    ]) {
      expect((1 - probabilities([x, 2000, 6000])[0]) * 100).toBeCloseTo(expected, 4)
    }
    expect(probabilities([2000, 2000, 2000])).toEqual([1 / 3, 1 / 3, 1 / 3])
    expect(pickPayer([2000, 2000, 2000], () => 0)).toBe(0)
    expect(pickPayer([2000, 2000, 2000], () => 0.5)).toBe(1)
    expect(pickPayer([2000, 2000, 2000], () => 0.99)).toBe(2)
  })
  it.each([
    { amounts: [2000, 2000, 6000] },
    { amounts: [6000, 2000, 6000] },
    { amounts: [10000, 2000, 6000] },
    { amounts: [2000, 2000, 2000] },
  ])("preserves final distributions and legal hands for $amounts", ({ amounts }) => {
    const random = seeded()
    const seen = new Set()
    // Check every draw, aggregating failures to avoid matcher overhead in the simulation loop.
    let invalidHands = 0,
      changedHumanHands = 0,
      excessiveTies = 0,
      wrongPayers = 0
    for (let hand = 0; hand < 3; hand++) {
      const counts = [0, 0, 0]
      for (let i = 0; i < 6000; i++) {
        const payer = pickPayer(amounts, random)
        let players = [0, 1, 2],
          ties = 0,
          steps = 0
        while (players.length > 1) {
          const result = match(players, payer, hand, ties, random)
          if (result.players.join() !== winners(result.hands, players).join()) invalidHands++
          if (players.includes(0) && result.hands[0] !== hand) changedHumanHands++
          if (result.tie) seen.add(`${players.length}-tie-${new Set(players.map((p) => result.hands[p])).size}`)
          else seen.add(`${players.length}-${result.players.length}`)
          ties = result.tie ? ties + 1 : 0
          if (ties > 2) excessiveTies++
          players = result.players
          if (++steps > 6) throw new Error("Round failed to finish within the legal maximum")
        }
        if (players[0] !== payer) wrongPayers++
        counts[players[0]]++
      }
      probabilities(amounts).forEach((p, i) => expect(Math.abs(counts[i] / 6000 - p)).toBeLessThan(0.02))
    }
    expect({ invalidHands, changedHumanHands, excessiveTies, wrongPayers }).toEqual({
      invalidHands: 0,
      changedHumanHands: 0,
      excessiveTies: 0,
      wrongPayers: 0,
    })
    expect([...seen]).toEqual(expect.arrayContaining(["3-tie-1", "3-tie-3", "2-tie-1", "3-1", "3-2", "2-1"]))
  })
  it("locks the basket and payer, prevents empty/overlimit baskets and duplicate actions", () => {
    let game = reducer({ phase: "title" }, { type: "start" })
    expect(reducer(game, { type: "confirm" })).toBe(game)
    for (let i = 0; i < 6; i++) game = reducer(game, { type: "quantity", index: 7, delta: 1 })
    expect(total(game.carts[0])).toBe(10000)
    game = reducer(game, { type: "confirm" })
    expect(reducer(game, { type: "confirm" })).toBe(game)
    expect(reducer(game, { type: "quantity", index: 0, delta: -1 })).toBe(game)
    game = reducer(game, { type: "hand", hand: 0 })
    expect(reducer(game, { type: "hand", hand: 1 })).toBe(game)
  })
  it("adds only own basket or subtracts all baskets, permits negative scores, resets rounds", () => {
    const base = {
      history: [],
      carts: [[], [], []],
      phase: "hand",
      players: [0, 1],
      amounts: [2000, 3000, 6000],
      ties: 2,
      score: 0,
      round: 1,
    }
    const paid = advance({ ...base, payer: 0 }, 0, () => 0)
    expect(paid.delta).toBe(-11000)
    expect(paid.score).toBe(-11000)
    const free = advance({ ...base, payer: 1 }, 0, () => 0)
    expect(free.delta).toBe(2000)
    const next = reducer(paid, { type: "next" })
    expect(total(next.carts[0])).toBe(0)
    expect(next.score).toBe(-11000)
    expect(next.round).toBe(2)
    expect(reducer({ ...paid, round: 3 }, { type: "next" }).phase).toBe("final")
    expect(reducer(paid, { type: "hand", hand: 0 })).toBe(paid)
  })
  it("persists negative first records and negative improvements", () => {
    expect(readBest()).toBeNull()
    expect(saveBest(-8000, readBest())).toBe(-8000)
    expect(readBest()).toBe(-8000)
    expect(saveBest(-3000, readBest())).toBe(-3000)
    expect(saveBest(-9000, readBest())).toBe(-3000)
    localStorage.setItem(BEST_KEY, "broken")
    expect(readBest()).toBeNull()
  })
})

it.each([
  [1, 1, 1],
  [0, 0, 0],
  [1, 0, 2],
])("keeps immutable round snapshots, reconciles score and resets history (%j)", (...payers) => {
  let game = reducer({ phase: "title" }, { type: "start" })
  for (let round = 1; round <= 3; round++) {
    const carts = PRODUCTS.map(() => 0)
    carts[0] = round
    game = {
      ...game,
      phase: "hand",
      carts: [carts, [...carts], [...carts]],
      amounts: [round * 100, round * 100, round * 100],
      players: [0, 1, 2],
      payer: payers[round - 1],
      ties: 2,
    }
    while (game.phase !== "result") game = advance(game, 0, () => 0)
    expect(game.history).toHaveLength(round)
    expect(reducer(game, { type: "hand", hand: 0 })).toBe(game)
    const snapshot = game.history[round - 1]
    expect(snapshot.carts[0][0]).toMatchObject({ name: "塩むすび", price: 100, quantity: round })
    carts[0] = 99
    expect(snapshot.carts[0][0].quantity).toBe(round)
    game = reducer(game, { type: "next" })
    expect(game.history).toHaveLength(round)
  }
  expect(game.phase).toBe("final")
  const gifts = game.history.filter((r) => r.payer !== 0).reduce((sum, r) => sum + r.amounts[0], 0)
  const paid = game.history
    .filter((r) => r.payer === 0)
    .reduce((sum, r) => sum + r.amounts.reduce((a, b) => a + b, 0), 0)
  expect(gifts - paid).toBe(game.score)
  expect(reducer(game, { type: "start" }).history).toEqual([])
  expect(reducer({ phase: "title" }, { type: "start" }).history).toEqual([])
})
