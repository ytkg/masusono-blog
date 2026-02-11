export const MINI_PLAYER_ARIA_LABELS = {
  expand: "ミニプレイヤーを展開",
  collapse: "ミニプレイヤーを縮小",
  close: "ミニプレイヤーを閉じる",
  play: "ミニプレイヤーで再生",
  pause: "ミニプレイヤーを一時停止",
  seekBackward10: "ミニプレイヤーで10秒戻る",
  seekForward10: "ミニプレイヤーで10秒進む",
}

export const EMBEDDED_PLAYER_ARIA_LABELS = {
  play: "再生",
  pause: "一時停止",
  seekBackward10: "10秒戻る",
  seekForward10: "10秒進む",
}

export function getMiniPlayerSeekSliderAriaLabel(title) {
  return `ミニプレイヤーの再生位置: ${title}`
}

export function getEmbeddedPlayerSeekSliderAriaLabel(title) {
  return `エピソード再生位置: ${title}`
}
