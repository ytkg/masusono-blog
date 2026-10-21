// Run with Node 22: node scripts/greed-balance.mjs
import { pickPayer } from "../app/frontend/features/apps/greed/game.js"
let seed = 733
const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32 }
console.log("| CPU1 / CPU2 | 自分 | 1ラウンド期待収支 | 3ラウンド P10 / 中央値 / P90 |")
console.log("| --- | ---: | ---: | ---: |")
for (const [a, b] of [[1000, 4000], [2000, 6000], [3000, 8000]]) {
  for (const x of [100, 1000, 2000, 3000, 6000, 10000]) {
    const p = x*x / (x*x + a*a + b*b)
    const scores = Array.from({ length: 30000 }, () => {
      let score = 0
      for (let round = 0; round < 3; round++) score += pickPayer([x, a, b], random) === 0 ? -(x+a+b) : x
      return score
    }).sort((l, r) => l-r)
    console.log(`| ${a} / ${b} | ${x} | ${Math.round((1-p)*x-p*(x+a+b))} | ${[0.1, 0.5, 0.9].map(q => scores[Math.floor(q*scores.length)]).join(" / ")} |`)
  }
}
