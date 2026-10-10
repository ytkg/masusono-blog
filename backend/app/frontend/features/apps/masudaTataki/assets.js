import masuda from "../masudaRun/assets/masuda_run.webp"
import other1 from "../masudaRun/assets/other1.webp"
import other2 from "../masudaRun/assets/other2.webp"

// この配列を差し替えるとキャラクター画像を変更できます。
export const IMAGES = [masuda, other1, other2]
export function loadImages() {
  return Promise.all(
    IMAGES.map(
      (src) =>
        new Promise((resolve, reject) => {
          const image = new Image()
          image.onload = resolve
          image.onerror = () => reject(new Error("画像を読み込めませんでした"))
          image.src = src
        }),
    ),
  )
}
