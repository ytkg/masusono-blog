export function fileName(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop())
  } catch {
    return "ファイル"
  }
}

export function isImage(item) {
  return Number.isFinite(item.width) && Number.isFinite(item.height)
}
