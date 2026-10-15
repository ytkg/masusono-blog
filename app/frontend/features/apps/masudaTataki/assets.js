import { loadImage } from "../shared/loadImage"
import masuda from "../masudaRun/assets/masuda_run.webp"
import other1 from "../masudaRun/assets/other1.webp"
import other2 from "../masudaRun/assets/other2.webp"

// この配列を差し替えるとキャラクター画像を変更できます。
export const IMAGES = [masuda, other1, other2]
export function loadImages({ signal } = {}) {
  return Promise.all(IMAGES.map((src) => loadImage(src, { signal })))
}
