export const PRODUCTS = [
  ["塩むすび", 100, "🍙"],
  ["鮭おにぎり", 180, "🍙"],
  ["焼きおにぎり", 200, "🍙"],
  ["たまごサンド", 280, "🥪"],
  ["カツサンド", 450, "🥪"],
  ["のり弁", 500, "🍱"],
  ["からあげ弁当", 650, "🍱"],
  ["ごほうび重", 2000, "🍱"],
  ["カップうどん", 220, "🍜"],
  ["大盛りラーメン", 350, "🍜"],
  ["ナポリタン", 550, "🍝"],
  ["肉まん", 160, "🥟"],
  ["フランク", 240, "🌭"],
  ["からあげ", 320, "🍗"],
  ["山盛りポテト", 400, "🍟"],
  ["板チョコ", 150, "🍫"],
  ["ポテトチップス", 190, "🥔"],
  ["クッキー", 300, "🍪"],
  ["キャンディ", 120, "🍬"],
  ["大袋おやつ", 800, "🍿"],
  ["バニラアイス", 180, "🍦"],
  ["カップアイス", 380, "🍨"],
  ["いちごパフェ", 700, "🍓"],
  ["プリン", 250, "🍮"],
  ["水", 100, "💧"],
  ["お茶", 140, "🍵"],
  ["コーヒー", 200, "☕"],
  ["果実ジュース", 260, "🧃"],
  ["缶ビール", 300, "🍺"],
  ["おつまみセット", 1200, "🧀"],
].map(([name, price, icon]) => ({ name, price, icon }))
export const HANDS = ["✊ グー", "✌️ チョキ", "🖐️ パー"]
export const NAMES = ["あなた", "CPU1", "CPU2"]
export const BEST_KEY = "masusono-greed-best"
export const yen = (value) => `${value.toLocaleString("ja-JP")}円`
export const total = (cart) => cart.reduce((sum, quantity, i) => sum + quantity * PRODUCTS[i].price, 0)
export const emptyCart = () => PRODUCTS.map(() => 0)
export const probabilities = (amounts) => {
  const sum = amounts.reduce((s, amount) => s + amount ** 2, 0)
  return amounts.map((amount) => amount ** 2 / sum)
}
export function pickPayer(amounts, random = Math.random) {
  const draw = random()
  const weights = probabilities(amounts)
  return draw < weights[0] ? 0 : draw < weights[0] + weights[1] ? 1 : 2
}
export function cpuCart(min, max, random = Math.random) {
  const cart = emptyCart()
  const target = min + Math.floor(random() * (max - min + 1))
  let remaining = target
  while (remaining >= 100) {
    const available = PRODUCTS.map((p, i) => i).filter((i) => PRODUCTS[i].price <= remaining)
    const index = available[Math.floor(random() * available.length)]
    cart[index]++
    remaining -= PRODUCTS[index].price
  }
  // The cheapest product fills the target to within 99 yen; repair the lower boundary.
  if (total(cart) < min) cart[0]++
  return cart
}
export function winners(hands, players) {
  const kinds = new Set(players.map((i) => hands[i]))
  if (kinds.size !== 2) return players
  const winning = [...kinds].find((hand) => kinds.has((hand + 1) % 3))
  return players.filter((i) => hands[i] === winning)
}
// Condition legal hands on the already drawn payer, preserving the final distribution.
export function match(players, payer, humanHand, ties, random = Math.random) {
  const tie = ties < 2 && random() < 0.25
  const options = []
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 3; b++)
      for (let c = 0; c < 3; c++) {
        const hands = [a, b, c]
        if (players.includes(0) && a !== humanHand) continue
        const next = winners(hands, players)
        if (!next.includes(payer)) continue
        if ((next.length === players.length) !== tie) continue
        options.push({ hands, players: next, tie })
      }
  return options[Math.floor(random() * options.length)]
}
export function readBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY)
    const value = Number(raw)
    return raw !== null && Number.isSafeInteger(value) ? value : null
  } catch {
    return null
  }
}
export function saveBest(score, best) {
  const next = best === null ? score : Math.max(score, best)
  try {
    localStorage.setItem(BEST_KEY, String(next))
  } catch {
    /* Play remains available without storage. */
  }
  return next
}
export function newRound(round = 1, score = 0, history = []) {
  return { phase: "shopping", round, score, history, carts: [emptyCart(), cpuCart(1000, 3000), cpuCart(4000, 8000)] }
}
export function advance(state, hand, random = Math.random) {
  const result = { ...match(state.players, state.payer, hand, state.ties, random), contestants: state.players }
  const finished = result.players.length === 1
  const delta = finished ? (state.payer === 0 ? -state.amounts.reduce((s, x) => s + x, 0) : state.amounts[0]) : 0
  return {
    ...state,
    phase: finished ? "result" : "reveal",
    result,
    players: result.players,
    ties: result.tie ? state.ties + 1 : 0,
    delta,
    score: state.score + delta,
    history: finished
      ? [
          ...state.history,
          {
            round: state.round,
            payer: state.payer,
            carts: state.carts.map((cart) =>
              cart.flatMap((quantity, i) => (quantity ? [{ ...PRODUCTS[i], quantity }] : [])),
            ),
            amounts: [...state.amounts],
          },
        ]
      : state.history,
  }
}
export function reducer(state, action) {
  if (action.type === "start" && ["title", "final"].includes(state.phase)) return newRound()
  if (action.type === "quantity" && state.phase === "shopping") {
    const cart = [...state.carts[0]]
    cart[action.index] = Math.max(0, cart[action.index] + action.delta)
    if (total(cart) > 10000) return state
    return { ...state, carts: [cart, ...state.carts.slice(1)] }
  }
  if (action.type === "confirm" && state.phase === "shopping" && total(state.carts[0]) > 0) {
    const amounts = state.carts.map(total)
    return { ...state, amounts, payer: pickPayer(amounts), players: [0, 1, 2], ties: 0, phase: "hand" }
  }
  if (action.type === "hand" && state.phase === "hand" && state.players.includes(0)) return advance(state, action.hand)
  if (action.type === "cpu" && state.phase === "hand" && !state.players.includes(0)) return advance(state)
  if (action.type === "continue" && state.phase === "reveal") return { ...state, phase: "hand" }
  if (action.type === "next" && state.phase === "result")
    return state.round === 3 ? { ...state, phase: "final" } : newRound(state.round + 1, state.score, state.history)
  return state
}
