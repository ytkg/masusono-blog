import { describe, expect, it } from "vitest"
import { advance, DURATION, hit, initialGame, multiplier, pace, rank } from "./game"
const withCharacter = (kind = "masuda", combo = 0, score = 0) => ({
  ...initialGame(),
  combo,
  score,
  holes: [{ kind, image: 0, until: 1200, hit: false }, ...Array(8).fill(null)],
})
describe("増田たたき", () => {
  it("得点倍率とランクの境界", () => {
    expect([1, 4, 5, 9, 10, 19, 20].map(multiplier)).toEqual([1, 1, 1.5, 1.5, 2, 2, 3])
    expect([0, 999, 1000, 2999, 3000, 5999, 6000].map(rank)).toEqual(["C", "C", "B", "B", "A", "A", "S"])
    expect([0, 9999, 10000, 19999, 20000].map(pace)).toEqual([
      [900, 1200],
      [900, 1200],
      [700, 1000],
      [700, 1000],
      [500, 800],
    ])
  })
  it("5回目から倍率を適用し二重加点しない", () => {
    const next = hit(withCharacter("masuda", 4), 0)
    expect(next).toMatchObject({ score: 150, combo: 5, maxCombo: 5, hits: 1 })
    expect(hit(next, 0)).toBe(next)
  })
  it("その他の減点は固定で下限0、コンボをリセット", () => {
    expect(hit(withCharacter("other", 20, 50), 0)).toMatchObject({ score: 0, combo: 0, mistakes: 1 })
    expect(hit(withCharacter("other", 20, 500), 0).score).toBe(400)
  })
  it("空振りはコンボを維持", () => {
    const game = withCharacter("masuda", 5)
    expect(hit(game, 8)).toBe(game)
  })
  it("増田を見逃すとリセット、その他の見逃しは維持", () => {
    expect(advance(withCharacter("masuda", 5), 1200, () => 0).combo).toBe(0)
    expect(advance(withCharacter("other", 5), 1200, () => 0).combo).toBe(5)
    expect(advance(hit(withCharacter("masuda", 5), 0), 1200, () => 0).combo).toBe(6)
  })
  it("空き穴だけに最大3体まで出現", () => {
    let game = initialGame()
    for (const elapsed of [20000, 20500, 21000]) game = advance(game, elapsed, () => 0)
    expect(game.holes.filter(Boolean)).toHaveLength(2)
    const full = {
      ...initialGame(),
      holes: Array.from({ length: 9 }, (_, i) => (i < 3 ? { kind: "masuda", until: 5000 } : null)),
    }
    expect(advance(full, 0, () => 0).holes.filter(Boolean)).toHaveLength(3)
  })
  it("75%境界とその他の画像をランダムに選択", () => {
    const values = [0, 0.75, 0.99]
    expect(advance(initialGame(), 0, () => values.shift()).holes[0]).toMatchObject({ kind: "other", image: 2 })
    expect(advance(initialGame(), 0, () => 0.74).holes[6].kind).toBe("masuda")
  })
  it("30秒で出現停止し終了後は採点しない", () => {
    const game = advance(withCharacter(), DURATION)
    expect(game.holes.every((hole) => hole === null)).toBe(true)
    expect(advance(game, DURATION + 1000)).toBe(game)
    expect(hit({ ...withCharacter(), elapsed: DURATION }, 0).score).toBe(0)
  })
})
