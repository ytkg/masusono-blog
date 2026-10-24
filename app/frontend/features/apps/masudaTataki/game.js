const HOLE_COUNT = 9
const BASE_HIT_POINTS = 100
const HIT_DISPLAY_DURATION_MS = 220
const OTHER_IMAGE_COUNT = 2

export const DURATION = 30000
export const MASUDA_RATIO = 0.75
export const MAX_CHARACTERS = 3
export const RANKS = [
  [6000, "S"],
  [3000, "A"],
  [1000, "B"],
  [0, "C"],
]
export const PACES = [
  [20000, 500, 800],
  [10000, 700, 1000],
  [0, 900, 1200],
]
export const comboBonus = (combo) => (combo > 0 && combo % 5 === 0 ? (combo % 10 === 0 ? 500 : 200) : 0)
export const rank = (score) => RANKS.find(([minimum]) => score >= minimum)[1]
export const pace = (elapsed) => PACES.find(([minimum]) => elapsed >= minimum).slice(1)
export const initialGame = () => ({
  elapsed: 0,
  nextSpawn: 0,
  holes: Array(HOLE_COUNT).fill(null),
  score: 0,
  combo: 0,
  maxCombo: 0,
  hits: 0,
  mistakes: 0,
})

export function advance(game, elapsed, random = Math.random) {
  if (game.elapsed >= DURATION) return game
  const next = { ...game, elapsed: Math.min(elapsed, DURATION) }
  next.holes = game.holes.map((character) => {
    if (!character || character.until > next.elapsed) return character
    if (character.kind === "masuda" && !character.hit) next.combo = 0
    return null
  })
  if (next.elapsed >= DURATION) return { ...next, holes: Array(HOLE_COUNT).fill(null) }
  if (elapsed < next.nextSpawn) return next
  const [interval, lifetime] = pace(elapsed)
  next.nextSpawn = elapsed + interval
  if (next.holes.filter(Boolean).length >= MAX_CHARACTERS) return next
  const empty = next.holes.flatMap((character, index) => (character ? [] : [index]))
  const index = empty[Math.floor(random() * empty.length)]
  const kind = random() < MASUDA_RATIO ? "masuda" : "other"
  next.holes[index] = {
    kind,
    image: kind === "masuda" ? 0 : 1 + Math.floor(random() * OTHER_IMAGE_COUNT),
    appearedAt: next.elapsed,
    until: elapsed + lifetime,
    hit: false,
  }
  return next
}

export function hit(game, index) {
  const character = game.holes[index]
  if (game.elapsed >= DURATION || !character || character.hit) return game
  const combo = character.kind === "masuda" ? game.combo + 1 : 0
  const fast = character.kind === "masuda" && game.elapsed - character.appearedAt <= 300
  const basePoints = character.kind === "masuda" ? (fast ? 150 : BASE_HIT_POINTS) : 0
  const bonus = comboBonus(combo)
  const points = basePoints + bonus
  const holes = [...game.holes]
  holes[index] = {
    ...character,
    hit: true,
    points,
    basePoints,
    bonus,
    fast,
    until: Math.min(character.until, game.elapsed + HIT_DISPLAY_DURATION_MS),
  }
  return {
    ...game,
    holes,
    combo,
    maxCombo: Math.max(combo, game.maxCombo),
    score: game.score + points,
    hits: game.hits + (character.kind === "masuda" ? 1 : 0),
    mistakes: game.mistakes + (character.kind === "other" ? 1 : 0),
  }
}
