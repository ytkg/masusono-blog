import { describe, expect, it } from "vitest"
import { CFG, CHAR_H, CHAR_W, HIT_H, HIT_W, HIGH_SCORE_KEY, RESTART_DELAY_MS } from "./constants"

describe("Masuda Run constants", () => {
  it("キャラクターと当たり判定の寸法を設定値から導出する", () => {
    expect(CHAR_H).toBe(Math.round(CFG.BASE_H * CFG.CHAR_SCALE))
    expect(CHAR_W).toBe(Math.round(CHAR_H * CFG.IMG_RATIO))
    expect(HIT_W).toBe(Math.round(CHAR_W * CFG.HIT_W_RATIO))
    expect(HIT_H).toBe(Math.round(CHAR_H * CFG.HIT_H_RATIO))
    expect(HIT_W).toBeLessThan(CHAR_W)
    expect(HIT_H).toBeLessThan(CHAR_H)
  })

  it("永続化キーと再開待機時間を定義する", () => {
    expect(HIGH_SCORE_KEY).toBe("masudarun_highscore")
    expect(RESTART_DELAY_MS).toBeGreaterThan(0)
  })
})
