import { describe, expect, it, vi } from "vitest"
import { drawCenterText } from "./draw"
import { CFG, CHAR_H, CHAR_W } from "./constants"
import { drawGround, drawObstacles, drawPlayer, drawStateText } from "./render"

vi.mock("./draw", () => ({
  drawCenterText: vi.fn(),
}))

describe("drawGround", () => {
  it("地面の線から下を黄土色で塗り、線を引く", () => {
    const ctx = {
      beginPath: vi.fn(),
      fillRect: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
    }

    drawGround(ctx, { groundY: 240 }, 900)

    expect(ctx.fillStyle).toBe("#EBCB72")
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 240, 900, CFG.BASE_H - 240)
    expect(ctx.strokeStyle).toBe("#C8B37D")
    expect(ctx.moveTo).toHaveBeenCalledWith(0, 240.5)
    expect(ctx.lineTo).toHaveBeenCalledWith(900, 240.5)
    expect(ctx.stroke).toHaveBeenCalledTimes(1)
  })
})

describe("drawStateText", () => {
  it("ready と gameover のメッセージを描く", () => {
    const ctx = { font: "" }

    drawStateText(ctx, 900, 300, "ready")
    drawStateText(ctx, 900, 300, "gameover")

    expect(drawCenterText).toHaveBeenNthCalledWith(1, ctx, 900, 300, "増田RUN - スペース/タップで開始")
    expect(drawCenterText).toHaveBeenNthCalledWith(2, ctx, 900, 300, "GAME OVER  -  スペース/タップで再開")
  })
})

describe("drawObstacles", () => {
  it("画像があれば drawImage、なければ fillRect を使う", () => {
    const ctx = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
    }
    const tallImage = { width: 40, height: 20 }

    drawObstacles(
      ctx,
      [
        { x: 10, y: 20, w: 30, h: 40, kind: "tall" },
        { x: 50, y: 60, w: 20, h: 30, kind: "short" },
      ],
      { tall: tallImage, short: null },
    )

    expect(ctx.drawImage).toHaveBeenCalledTimes(1)
    expect(ctx.fillRect).toHaveBeenCalledWith(50, 60, 20, 30)
  })
})

describe("drawPlayer", () => {
  it("spin がないときはそのまま画像を描く", () => {
    const ctx = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
    }

    drawPlayer(ctx, { x: 20, y: 100, w: 40, h: 50, spin: 0 }, { width: 10, height: 10 })

    expect(ctx.drawImage).toHaveBeenCalledWith(
      expect.anything(),
      Math.round(20 - (CHAR_W - 40) / 2),
      Math.round(100 + 50 - CHAR_H),
      CHAR_W,
      CHAR_H,
    )
    expect(ctx.fillRect).not.toHaveBeenCalled()
  })

  it("画像がなければ矩形で描く", () => {
    const ctx = {
      drawImage: vi.fn(),
      fillRect: vi.fn(),
    }

    drawPlayer(ctx, { x: 20, y: 100, w: 40, h: 50, spin: 0 }, null)

    expect(ctx.fillRect).toHaveBeenCalledTimes(1)
  })
})

it.each([CFG.SPIN_MS, CFG.SPIN_MS / 2, CFG.SPIN_MS / 4])("回転の残り時間 %i に応じて中心を軸に描画する", (spin) => {
  const ctx = Object.fromEntries(["save", "translate", "rotate", "drawImage", "restore"].map((key) => [key, vi.fn()]))
  const player = { x: 20, y: 100, w: 40, h: 50, spin }
  const image = { width: 10, height: 10 }
  drawPlayer(ctx, player, image)
  expect(ctx.translate).toHaveBeenCalledWith(
    Math.round(player.x - (CHAR_W - player.w) / 2) + CHAR_W / 2,
    Math.round(player.y + player.h - CHAR_H) + CHAR_H / 2,
  )
  expect(ctx.rotate).toHaveBeenCalledWith((1 - spin / CFG.SPIN_MS) * Math.PI * 2)
  expect(ctx.drawImage).toHaveBeenCalledWith(image, -CHAR_W / 2, -CHAR_H / 2, CHAR_W, CHAR_H)
  expect(ctx.save).toHaveBeenCalledOnce()
  expect(ctx.restore).toHaveBeenCalledOnce()
  expect(ctx.save.mock.invocationCallOrder[0]).toBeLessThan(ctx.rotate.mock.invocationCallOrder[0])
  expect(ctx.drawImage.mock.invocationCallOrder[0]).toBeLessThan(ctx.restore.mock.invocationCallOrder[0])
})
