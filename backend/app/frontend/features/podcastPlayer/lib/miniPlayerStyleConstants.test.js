import { describe, expect, it } from "vitest"
import {
  MINI_PLAYER_CARD_BOX_SHADOW,
  MINI_PLAYER_CONTAINER_Z_INDEX_OFFSET,
  MINI_PLAYER_DRAG_THRESHOLD_PX,
  MINI_PLAYER_THUMBNAIL_SIZE,
} from "./miniPlayerStyleConstants"

describe("miniPlayerStyleConstants", () => {
  it("ミニプレイヤー用のスタイル定数を公開する", () => {
    expect(MINI_PLAYER_DRAG_THRESHOLD_PX).toBe(3)
    expect(MINI_PLAYER_CONTAINER_Z_INDEX_OFFSET).toBe(1)
    expect(MINI_PLAYER_CARD_BOX_SHADOW).toBe(3)
    expect(MINI_PLAYER_THUMBNAIL_SIZE).toEqual({ xs: 56, sm: 64 })
  })
})
