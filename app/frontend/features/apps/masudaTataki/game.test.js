import { describe, expect, it } from "vitest"
import { advance, DURATION, hit, initialGame, comboBonus, pace, rank } from "./game"
const withCharacter = (kind = "masuda", combo = 0, score = 0) => ({
  ...initialGame(),
  combo,
  score,
  holes: [{ kind, image: 0, appearedAt: 0, until: 1200, hit: false }, ...Array(8).fill(null)],
})
describe("増田たたき", () => {
  it("コンボボーナスとランクの境界", () => {
    expect([0, 1, 4, 5, 6, 9, 10, 15, 20, 25, 30].map(comboBonus)).toEqual([
      0, 0, 0, 200, 0, 0, 500, 200, 500, 200, 500,
    ])
    expect([0, 999, 1000, 2999, 3000, 5999, 6000].map(rank)).toEqual(["C", "C", "B", "B", "A", "A", "S"])
    expect([0, 9999, 10000, 19999, 20000].map(pace)).toEqual([
      [900, 1200],
      [900, 1200],
      [700, 1000],
      [700, 1000],
      [500, 800],
    ])
  })
  it("出現から300ミリ秒以内は150点、それ以降は100点", () => {
    for (const [elapsed, points] of [
      [1000, 150],
      [1299, 150],
      [1300, 150],
      [1301, 100],
    ]) {
      const game = withCharacter()
      game.elapsed = elapsed
      game.holes[0].appearedAt = 1000
      game.holes[0].until = 2200
      const next = hit(game, 0)
      expect(next.score).toBe(points)
      expect(next.holes[0]).toMatchObject({ basePoints: points, bonus: 0, fast: points === 150 })
      expect(hit(next, 0)).toBe(next)
    }
  })
  it("早叩きとコンボボーナスを別々に加算する", () => {
    for (const [combo, bonus] of [
      [4, 200],
      [9, 500],
      [14, 200],
      [19, 500],
    ]) {
      const next = hit(withCharacter("masuda", combo, 1000), 0)
      expect(next).toMatchObject({ score: 1150 + bonus, combo: combo + 1, maxCombo: combo + 1, hits: 1 })
      expect(next.holes[0]).toMatchObject({ basePoints: 150, bonus, points: 150 + bonus })
      expect(hit({ ...withCharacter("masuda", combo), elapsed: 301 }, 0).score).toBe(100 + bonus)
    }
  })
  it("その他は減点せずコンボだけをリセットし、次の5連続でまたボーナスを狙える", () => {
    const missed = hit({ ...withCharacter("other", 9, 1550), maxCombo: 9 }, 0)
    expect(missed).toMatchObject({ score: 1550, combo: 0, mistakes: 1 })
    expect(missed.holes[0].points).toBe(0)
    let game = missed
    for (let i = 0; i < 5; i++) {
      game = hit({ ...withCharacter("masuda", game.combo, game.score), maxCombo: game.maxCombo }, 0)
    }
    expect(game).toMatchObject({ score: 2500, combo: 5, maxCombo: 9 })
    expect(hit(withCharacter("other"), 0).score).toBe(0)
    expect(advance(withCharacter("masuda", 9, 1550), 1200, () => 0)).toMatchObject({ score: 1550, combo: 0 })
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

it("advances without changing the previous game or its characters", () => {
  const game = withCharacter("masuda", 5)
  const original = structuredClone(game)
  const next = advance(game, 1200, () => 0)
  expect(game).toEqual(original)
  expect(next.holes).not.toBe(game.holes)
  expect(next.combo).toBe(0)
})
