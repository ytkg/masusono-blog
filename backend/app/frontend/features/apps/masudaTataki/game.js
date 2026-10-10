export const DURATION = 30000
export const MASUDA_RATIO = 0.75
export const MAX_CHARACTERS = 3
export const RANKS = [
  [6000, "S"],
  [3000, "A"],
  [1000, "B"],
  [0, "C"],
]
export const MULTIPLIERS = [
  [20, 3],
  [10, 2],
  [5, 1.5],
  [1, 1],
]
export const PACES = [
  [20000, 500, 800],
  [10000, 700, 1000],
  [0, 900, 1200],
]
export const multiplier = (combo) => MULTIPLIERS.find(([minimum]) => combo >= minimum)?.[1] ?? 1
export const rank = (score) => RANKS.find(([minimum]) => score >= minimum)[1]
export const pace = (elapsed) => PACES.find(([minimum]) => elapsed >= minimum).slice(1)
export const initialGame = () => ({
  elapsed: 0,
  nextSpawn: 0,
  holes: Array(9).fill(null),
  score: 0,
  combo: 0,
  maxCombo: 0,
  hits: 0,
  mistakes: 0,
})

export function advance(game, elapsed, random = Math.random) {
  if (game.elapsed >= DURATION) return game
  const next = { ...game, elapsed: Math.min(elapsed, DURATION), holes: [...game.holes] }
  next.holes = next.holes.map((character) => {
    if (!character || character.until > next.elapsed) return character
    if (character.kind === "masuda" && !character.hit) next.combo = 0
    return null
  })
  if (next.elapsed >= DURATION) return { ...next, holes: Array(9).fill(null) }
  if (elapsed < next.nextSpawn) return next
  const [interval, lifetime] = pace(elapsed)
  next.nextSpawn = elapsed + interval
  if (next.holes.filter(Boolean).length >= MAX_CHARACTERS) return next
  const empty = next.holes.flatMap((character, index) => (character ? [] : [index]))
  const index = empty[Math.floor(random() * empty.length)]
  const kind = random() < MASUDA_RATIO ? "masuda" : "other"
  next.holes[index] = {
    kind,
    image: kind === "masuda" ? 0 : 1 + Math.floor(random() * 2),
    until: elapsed + lifetime,
    hit: false,
  }
  return next
}

export function hit(game, index) {
  const character = game.holes[index]
  if (game.elapsed >= DURATION || !character || character.hit) return game
  const combo = character.kind === "masuda" ? game.combo + 1 : 0
  const points = character.kind === "masuda" ? 100 * multiplier(combo) : -100
  const holes = [...game.holes]
  holes[index] = { ...character, hit: true, points, until: Math.min(character.until, game.elapsed + 220) }
  return {
    ...game,
    holes,
    combo,
    maxCombo: Math.max(combo, game.maxCombo),
    score: Math.max(0, game.score + points),
    hits: game.hits + (character.kind === "masuda" ? 1 : 0),
    mistakes: game.mistakes + (character.kind === "other" ? 1 : 0),
  }
}
