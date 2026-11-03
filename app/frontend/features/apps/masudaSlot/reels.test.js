import { expect, it } from "vitest"
import { LINES, outcomes, REELS, SIZE, stopReel, stopTable, symbolAt, wrap } from "./reels"

it("keeps every role legal within four steps for every partial state, press position and stop order", () => {
  for (const role of ["none", "bell", "cherry", "melon", "replay", "BIG", "REG"]) {
    const table = stopTable(role)
    expect(table.size).toBe((SIZE + 1) ** 3)
    expect(table.get("-1,-1,-1").safe).toBe(true)
    let wins = 0
    let misses = 0
    for (const [key, value] of table) {
      if (!value.safe) continue
      const positions = key.split(",").map(Number)
      if (!positions.includes(-1)) {
        const roles = outcomes(positions)
        expect(roles.length === 0 || (roles.length === 1 && roles[0] === role)).toBe(true)
        if (roles.length) wins++
        else misses++
      }
      positions.forEach((position, reel) => {
        if (position !== -1) return
        for (let press = 0; press < SIZE; press++) {
          const stopped = stopReel(role, positions, reel, press)
          const next = [...positions]
          next[reel] = stopped.position
          expect(stopped.slide).toBeGreaterThanOrEqual(0)
          expect(stopped.slide).toBeLessThanOrEqual(4)
          expect(stopped.position).toBe(wrap(press + stopped.slide))
          expect(table.get(next.join(",")).safe).toBe(true)
        }
      })
    }
    if (role !== "none") expect(wins).toBeGreaterThan(0)
    expect(misses).toBeGreaterThan(0)
  }
}, 30000)

it("evaluates all five lines, both bonuses, cherry in all three rows, and deduplicates payouts", () => {
  for (const role of ["bell", "melon", "replay", "BIG", "REG"]) {
    for (const line of LINES) {
      const positions = REELS.map((strip, reel) =>
        wrap(
          strip.indexOf(role === "BIG" || role === "REG" ? (role === "REG" && reel === 2 ? "bar" : "seven") : role) -
            line[reel],
        ),
      )
      expect(outcomes(positions)).toContain(role)
    }
  }
  for (const row of [-1, 0, 1]) expect(outcomes([wrap(REELS[0].indexOf("cherry") - row), 0, 0])).toContain("cherry")
  expect(symbolAt(0, 0, -1)).toBe(REELS[0][SIZE - 1])
  for (let a = 0; a < SIZE; a++)
    for (let b = 0; b < SIZE; b++)
      for (let c = 0; c < SIZE; c++) {
        const result = outcomes([a, b, c])
        expect(new Set(result).size).toBe(result.length)
      }
})
