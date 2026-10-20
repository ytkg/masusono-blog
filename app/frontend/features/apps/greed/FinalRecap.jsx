import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { NAMES, yen } from "./game"

export default function FinalRecap({ history }) {
  const items = new Map()
  const payments = history.filter((round) => round.payer === 0)
  for (const round of history) {
    for (const item of round.carts[0]) {
      const key = `${item.name}:${item.price}`
      const previous = items.get(key)
      items.set(key, { ...item, quantity: item.quantity + (previous?.quantity || 0) })
    }
  }
  const itemTotal = [...items.values()].reduce((sum, item) => sum + item.quantity * item.price, 0)
  const paidTotal = payments.reduce((sum, round) => sum + round.amounts.reduce((a, b) => a + b, 0), 0)
  const card = { p: { xs: 2, sm: 3 }, borderRadius: 2, bgcolor: "#fffdf2", color: "#30273f", minWidth: 0 }
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
        alignItems: "start",
        maxWidth: 1100,
        mx: "auto",
        mb: 4,
        textAlign: "left",
      }}
    >
      <Box component="section" aria-label="手に入った商品" sx={card}>
        <Typography component="h4" variant="h5" fontWeight={800}>
          手に入った商品
        </Typography>
        <Typography sx={{ my: 2, fontWeight: 800 }}>合計 {yen(itemTotal)}分</Typography>
        <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
          {[...items.values()].map((item) => (
            <Box
              component="li"
              key={`${item.name}:${item.price}`}
              sx={{ display: "flex", alignItems: "center", gap: 2, py: 1, borderBottom: "1px dashed #d6c6ad" }}
            >
              <Box aria-hidden="true" sx={{ fontSize: 36 }}>
                {item.icon}
              </Box>
              <Typography>
                {item.name} ×{item.quantity}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <Box component="section" aria-label="自分のお支払い" sx={card}>
        <Typography component="h4" variant="h5" fontWeight={800}>
          自分のお支払い合計
          <Box component="span" sx={{ display: "block", fontSize: 32, whiteSpace: "nowrap", mt: 1 }}>
            {yen(paidTotal)}
          </Box>
        </Typography>
        {payments.length ? (
          payments.map((round) => (
            <Box
              key={round.round}
              sx={{
                mt: 3,
                p: 2,
                bgcolor: "#fffef8",
                border: "1px dashed #b8ad99",
                fontFamily: "monospace",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <Typography component="h5" fontWeight={700}>
                ラウンド{round.round}：{yen(round.amounts.reduce((a, b) => a + b, 0))}
              </Typography>
              {round.amounts.map((amount, i) => (
                <Typography key={NAMES[i]} sx={{ display: "flex", justifyContent: "space-between", gap: 1, mt: 1 }}>
                  <span>{NAMES[i]}</span>
                  <span>{yen(amount)}</span>
                </Typography>
              ))}
              <Box component="details" sx={{ mt: 2, "& summary": { cursor: "pointer", py: 1, minHeight: 44 } }}>
                <summary>購入者ごとの商品明細</summary>
                {round.carts.map((cart, i) => (
                  <Box key={NAMES[i]} sx={{ mt: 2 }}>
                    <Typography component="h6" fontWeight={700}>
                      {NAMES[i]}
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, my: 1 }}>
                      {cart.map((item) => (
                        <li key={item.name}>
                          {item.name} ×{item.quantity} · {yen(item.price * item.quantity)}
                        </li>
                      ))}
                    </Box>
                    <Typography variant="body2">小計 {yen(round.amounts[i])}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))
        ) : (
          <Typography sx={{ mt: 2 }}>お支払い 0円。全部ごちそうになりました</Typography>
        )}
      </Box>
    </Box>
  )
}
