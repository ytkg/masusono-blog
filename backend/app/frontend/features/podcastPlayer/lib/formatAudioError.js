export function formatAudioError(audio) {
  const mediaError = audio.error
  if (!mediaError) return "音声の読み込みに失敗しました。"

  switch (mediaError.code) {
    case mediaError.MEDIA_ERR_ABORTED:
      return "音声の読み込みが中断されました。"
    case mediaError.MEDIA_ERR_NETWORK:
      return "ネットワークエラーで音声を取得できませんでした。"
    case mediaError.MEDIA_ERR_DECODE:
      return "音声データの再生に失敗しました。"
    case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return "この音声フォーマットは再生できません。"
    default:
      return "音声の読み込みに失敗しました。"
  }
}
