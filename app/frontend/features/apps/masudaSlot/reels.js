export const SYMBOLS = { seven: "7", bar: "BAR", bell: "🔔", cherry: "🍒", melon: "🍉", replay: "↻", blank: "◆" }
export const REELS = [
  [
    "seven",
    "bell",
    "replay",
    "blank",
    "melon",
    "bell",
    "bar",
    "replay",
    "blank",
    "bell",
    "cherry",
    "replay",
    "seven",
    "bell",
    "blank",
    "replay",
    "bell",
    "blank",
    "bar",
    "bell",
    "replay",
  ],
  [
    "seven",
    "bell",
    "blank",
    "replay",
    "bar",
    "bell",
    "melon",
    "blank",
    "replay",
    "bell",
    "seven",
    "blank",
    "replay",
    "bell",
    "bar",
    "blank",
    "replay",
    "bell",
    "blank",
    "bell",
    "replay",
  ],
  [
    "seven",
    "bell",
    "replay",
    "blank",
    "bar",
    "bell",
    "blank",
    "replay",
    "melon",
    "bell",
    "seven",
    "replay",
    "blank",
    "bell",
    "bar",
    "replay",
    "blank",
    "bell",
    "replay",
    "bell",
    "blank",
  ],
]
export const SIZE = REELS[0].length
export const LINES = [
  [-1, -1, -1],
  [0, 0, 0],
  [1, 1, 1],
  [-1, 0, 1],
  [1, 0, -1],
]
export const wrap = (index) => ((index % SIZE) + SIZE) % SIZE
export const symbolAt = (reel, center, row = 0) => REELS[reel][wrap(center + row)]

export function outcomes(positions) {
  const result = new Set()
  if ([-1, 0, 1].some((row) => symbolAt(0, positions[0], row) === "cherry")) result.add("cherry")
  for (const line of LINES) {
    const symbols = positions.map((position, reel) => symbolAt(reel, position, line[reel]))
    if (symbols.every((symbol) => symbol === "seven")) result.add("BIG")
    if (symbols[0] === "seven" && symbols[1] === "seven" && symbols[2] === "bar") result.add("REG")
    for (const role of ["bell", "melon", "replay"]) {
      if (symbols.every((symbol) => symbol === role)) result.add(role)
    }
  }
  return [...result]
}

const tables = new Map()
// A safe partial stop must allow a legal stop within four steps for EVERY later
// press position and either remaining stop order, including when the role is missed.
export function stopTable(role) {
  if (tables.has(role)) return tables.get(role)
  const table = new Map()
  function visit(positions) {
    const key = positions.join(",")
    if (table.has(key)) return table.get(key)
    const free = positions.flatMap((position, reel) => (position === -1 ? [reel] : []))
    let safe = true
    let wins = 0
    if (!free.length) {
      const roles = outcomes(positions)
      safe = roles.length === 0 || (roles.length === 1 && roles[0] === role)
      wins = safe && roles[0] === role ? 1 : 0
    } else {
      for (const reel of free) {
        const children = Array.from({ length: SIZE }, (_, position) => {
          const next = [...positions]
          next[reel] = position
          return visit(next)
        })
        wins = Math.max(
          wins,
          children.reduce((sum, child) => sum + (child.safe ? child.wins : 0), 0),
        )
        if (
          children.some(
            (_, press) => !Array.from({ length: 5 }, (_, slide) => children[wrap(press + slide)].safe).some(Boolean),
          )
        )
          safe = false
      }
    }
    const value = { safe, wins }
    table.set(key, value)
    return value
  }
  visit([-1, -1, -1])
  tables.set(role, table)
  return table
}

export function stopReel(role, positions, reel, press) {
  const table = stopTable(role)
  let best
  for (let slide = 0; slide <= 4; slide++) {
    const position = wrap(press + slide)
    const next = [...positions]
    next[reel] = position
    const value = table.get(next.join(","))
    if (value.safe && (!best || value.wins > best.wins)) best = { position, slide, wins: value.wins }
  }
  if (!best) throw new Error(`No legal reel stop: ${role}/${positions}/${reel}/${press}`)
  return best
}
