import Storefront from "./Storefront"
import Receipt from "./Receipt"
import FinalRecap from "./FinalRecap"
import { useEffect, useReducer, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import MuiLink from "@mui/material/Link"
import { Link } from "@inertiajs/react"
import usePageVisible from "../../../shared/hooks/usePageVisible"
import { useAppActive } from "../shared/AppActivityContext"
import { PRODUCTS, HANDS, NAMES, yen, total, probabilities, readBest, saveBest, reducer } from "./game"

const panel = { p: 2, borderRadius: 2, bgcolor: "#fffdf2", border: "2px solid #e5c9a2", color: "#30273f" }
function Cart({ cart, name }) {
  return (
    <Box sx={panel}>
      <Typography component="h4" fontWeight={700}>
        {name} · {yen(total(cart))}
      </Typography>
      <Typography variant="body2">
        {cart.flatMap((q, i) => (q ? [`${PRODUCTS[i].icon} ${PRODUCTS[i].name} ×${q}`] : [])).join(" / ") ||
          "カゴは空です"}
      </Typography>
    </Box>
  )
}
export default function GreedGame() {
  const [game, dispatch] = useReducer(reducer, { phase: "title" })
  const [best, setBest] = useState(readBest)
  const screenRef = useRef(null)
  useEffect(() => {
    if (screenRef.current) screenRef.current.scrollTop = 0
  }, [game.phase, game.round])
  const appActive = useAppActive()
  const pageVisible = usePageVisible()
  const active = appActive && pageVisible
  useEffect(() => {
    if (!active || !["hand", "reveal"].includes(game.phase) || game.players.includes(0)) return
    const timer = setTimeout(() => dispatch({ type: game.phase === "reveal" ? "continue" : "cpu" }), 1200)
    return () => clearTimeout(timer)
  }, [active, game])
  const send = (type, extra = {}) => {
    if (active) dispatch({ type, ...extra })
  }
  useEffect(() => {
    if (game.phase === "result" && game.round === 3) setBest((previous) => saveBest(game.score, previous))
  }, [game.phase, game.round, game.score])
  const next = () => send("next")
  const amount = game.carts ? total(game.carts[0]) : 0
  return (
    <Box
      ref={screenRef}
      component="section"
      aria-label="強欲のゲーム画面"
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        pt: { xs: 2, sm: 3 },
        pl: "max(16px, env(safe-area-inset-left))",
        pr: "max(16px, env(safe-area-inset-right))",
        pb: "max(24px, env(safe-area-inset-bottom))",
        bgcolor: "#29283e",
        color: "#fff8e4",
      }}
    >
      <Typography sx={{ textAlign: "center", letterSpacing: 3, color: "#ffe787" }}>
        🌙 MIDNIGHT MART · 24時間営業
      </Typography>
      {game.phase === "title" ? (
        <Box sx={{ maxWidth: 760, mx: "auto", textAlign: "center", py: { xs: 2, sm: 4 } }}>
          <Storefront />
          <Typography variant="h4" component="h3" fontWeight={800}>
            強欲は身を滅ぼす？
          </Typography>
          <Typography sx={{ my: 2 }}>好きな商品をカゴへ。じゃんけんで勝ち残った1人が全員に奢る！</Typography>
          <Typography sx={{ mb: 2 }}>自己ベスト：{best === null ? "記録なし" : yen(best)}</Typography>
          <Button variant="contained" disabled={!active} onClick={() => send("start")}>
            買い物を始める
          </Button>
          <Box sx={{ ...panel, textAlign: "left", my: 3 }}>
            <Typography>全3ラウンド。CPUのカゴを見て、100〜10,000円のお買い物。</Typography>
            <Typography>奢ってもらえば自分の商品代を加算。奢ると全員分を減算します。</Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, color: "#e3d9bd" }}>
            このゲームのきっかけ
          </Typography>
          <MuiLink
            component={Link}
            href="/articles/uqu8cokro"
            color="inherit"
            sx={{ display: "inline-block", py: 1.5 }}
          >
            強欲は身を滅ぼす？を読む →
          </MuiLink>
        </Box>
      ) : game.phase === "final" ? (
        <Box sx={{ textAlign: "center", py: 5 }}>
          <Typography variant="h4" component="h3">
            3ラウンド完走！
          </Typography>
          <Typography variant="h3" sx={{ my: 3 }}>
            合計 {yen(game.score)}
          </Typography>
          <Typography sx={{ mb: 3 }}>自己ベスト：{best === null ? "記録なし" : yen(best)}</Typography>
          <FinalRecap history={game.history} />
          <Button variant="contained" disabled={!active} onClick={() => send("start")}>
            再挑戦
          </Button>
          <Box sx={{ mt: 2 }}>
            <MuiLink
              component={Link}
              href="/articles/uqu8cokro"
              color="inherit"
              sx={{ display: "inline-block", py: 1.5 }}
            >
              元になった記事を読む →
            </MuiLink>
          </Box>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 1,
              my: 2,
            }}
          >
            <Typography component="h3" variant="h5">
              ラウンド {game.round} / 3
            </Typography>
            <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>合計スコア {yen(game.score)}</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, mb: 2 }}>
            <Cart cart={game.carts[1]} name="CPU1" />
            <Cart cart={game.carts[2]} name="CPU2" />
          </Box>
          {game.phase === "shopping" ? (
            <>
              <Box sx={{ ...panel, position: "sticky", top: 0, zIndex: 1, mb: 2, boxShadow: 3 }}>
                <Typography fontWeight={800}>あなたのカゴ：{yen(amount)} / 10,000円</Typography>
                <Typography>
                  奢ってもらえる確率：{((1 - probabilities(game.carts.map(total))[0]) * 100).toFixed(2)}%
                </Typography>
                <Button
                  variant="contained"
                  disabled={!active || amount === 0}
                  onClick={() => send("confirm")}
                  sx={{ mt: 1 }}
                >
                  カゴを確定して勝負
                </Button>
                {amount === 0 && <Typography variant="body2">商品を1つ以上選んでください。</Typography>}
              </Box>
              <Typography component="h4" sx={{ mb: 1 }}>
                深夜の商品棚 · 同じ商品もいくつでも
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(auto-fit, minmax(160px, 1fr))" },
                  gap: 1.5,
                }}
              >
                {PRODUCTS.map((product, i) => (
                  <Box
                    key={product.name}
                    sx={{ ...panel, textAlign: "center", p: 1, borderBottom: "7px solid #dfad75" }}
                  >
                    <Typography aria-hidden="true" sx={{ fontSize: 38 }}>
                      {product.icon}
                    </Typography>
                    <Typography fontWeight={700}>{product.name}</Typography>
                    <Typography>{yen(product.price)}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Button
                        sx={{ minWidth: 44, minHeight: 44 }}
                        aria-label={`${product.name}を減らす`}
                        disabled={!active || !game.carts[0][i]}
                        onClick={() => send("quantity", { index: i, delta: -1 })}
                      >
                        −
                      </Button>
                      <Typography aria-label={`${product.name}の数量`}>{game.carts[0][i]}</Typography>
                      <Button
                        sx={{ minWidth: 44, minHeight: 44 }}
                        aria-label={`${product.name}を追加`}
                        disabled={!active || amount + product.price > 10000}
                        onClick={() => send("quantity", { index: i, delta: 1 })}
                      >
                        ＋
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            <>
              <Cart cart={game.carts[0]} name="あなた" />
              <Box sx={{ ...panel, mt: 2, textAlign: "center" }} aria-live="polite">
                {game.phase === "hand" ? (
                  <>
                    <Typography variant="h5" component="h4">
                      {game.players.length === 2 ? "2人で決戦！" : "じゃんけん！"}
                    </Typography>
                    <Typography>参加者：{game.players.map((i) => NAMES[i]).join("・")}</Typography>
                    {game.players.includes(0) ? (
                      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 1, mt: 2 }}>
                        {HANDS.map((hand, i) => (
                          <Button
                            key={hand}
                            variant="contained"
                            disabled={!active}
                            onClick={() => send("hand", { hand: i })}
                          >
                            {hand}
                          </Button>
                        ))}
                      </Box>
                    ) : (
                      <Typography>あなたは負け抜け。CPU同士の決戦を見届けよう…</Typography>
                    )}
                  </>
                ) : (
                  <>
                    <Typography>
                      {game.result.contestants?.map((i) => `${NAMES[i]}：${HANDS[game.result.hands[i]]}`).join(" / ")}
                    </Typography>
                    {game.phase === "reveal" ? (
                      <>
                        <Typography variant="h5" sx={{ my: 2 }}>
                          {game.result.tie
                            ? `あいこ（${game.ties}回目）`
                            : `${game.players.map((i) => NAMES[i]).join("・")}が勝ち残り！`}
                        </Typography>
                        {game.players.includes(0) ? (
                          <Button variant="contained" disabled={!active} onClick={() => send("continue")}>
                            次のじゃんけんへ
                          </Button>
                        ) : (
                          <Typography>CPU同士の決戦へ進みます…</Typography>
                        )}
                      </>
                    ) : (
                      <>
                        <Typography variant="h5" component="h4" sx={{ my: 2 }}>
                          {NAMES[game.payer]}が勝ち残り、全員に奢る！
                        </Typography>
                        <Receipt carts={game.carts} round={game.round} />
                        <Typography>
                          ラウンド収支：{game.delta > 0 ? "+" : ""}
                          {yen(game.delta)}
                        </Typography>
                        <Typography sx={{ mb: 2 }}>現在の合計スコア：{yen(game.score)}</Typography>
                        <Button variant="contained" disabled={!active} onClick={next}>
                          {game.round === 3 ? "最終結果を見る" : "次のラウンドへ"}
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  )
}
