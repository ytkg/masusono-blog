import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { PRODUCTS, total, yen } from "./game"

export default function Receipt({ carts, round }) {
  const quantities = PRODUCTS.map((_, index) => carts.reduce((sum, cart) => sum + cart[index], 0))
  const number = String(round).padStart(4, "0")
  return (
    <Box
      component="section"
      aria-label="会計レシート"
      sx={{
        position: "relative",
        bgcolor: "#fffef8",
        color: "#202020",
        mx: "auto",
        maxWidth: 360,
        p: { xs: 2, sm: 3 },
        my: 3,
        textAlign: "left",
        fontFamily: "monospace",
        fontSize: 14,
        fontVariantNumeric: "tabular-nums",
        boxShadow: "0 4px 12px #0002",
        "& .MuiTypography-root": { fontFamily: "inherit", fontSize: "inherit", lineHeight: 1.8 },
        "&::after": {
          content: '""',
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -8,
          height: 8,
          background:
            "linear-gradient(135deg, #fffef8 25%, transparent 25%) -4px 0 / 8px 8px, linear-gradient(225deg, #fffef8 25%, transparent 25%) -4px 0 / 8px 8px",
        },
      }}
    >
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography sx={{ fontWeight: 900, letterSpacing: 2 }}>MIDNIGHT MART</Typography>
        <Typography>深夜店 · 24時間営業</Typography>
        <Typography component="h5" sx={{ mt: 1, letterSpacing: 6 }}>
          領収証
        </Typography>
      </Box>
      <Typography>レジ01 取引 {number}</Typography>
      <Box
        component="table"
        aria-label="お買い上げ明細"
        sx={{
          width: "100%",
          borderCollapse: "collapse",
          my: 1,
          borderTop: "1px dashed",
          borderBottom: "1px dashed",
          "& th, & td": { py: 0.75, verticalAlign: "top" },
          "& th": { fontWeight: 400, borderBottom: "1px dashed" },
          "& th:not(:first-of-type), & td:not(:first-of-type)": { textAlign: "right", whiteSpace: "nowrap", pl: 1 },
        }}
      >
        <thead>
          <tr>
            <th scope="col">商品</th>
            <th scope="col">数量</th>
            <th scope="col">金額</th>
          </tr>
        </thead>
        <tbody>
          {PRODUCTS.map((product, index) =>
            quantities[index] > 0 ? (
              <tr key={product.name}>
                <td>
                  {product.name}
                  <Box sx={{ fontSize: 12 }}>単価 {yen(product.price)}</Box>
                </td>
                <td>{quantities[index]}</td>
                <td>{yen(product.price * quantities[index])}</td>
              </tr>
            ) : null,
          )}
        </tbody>
      </Box>
      <Typography>お買い上げ数量 {quantities.reduce((sum, quantity) => sum + quantity, 0)}個</Typography>
      <Typography sx={{ fontWeight: 900, py: 1, borderBottom: "2px solid" }}>
        お支払い合計：{yen(total(quantities))}
      </Typography>
      <Box sx={{ textAlign: "center", mt: 2 }}>
        <Typography>ありがとうございました</Typography>
        <Typography>またのご来店をお待ちしております</Typography>
        <Box
          aria-hidden="true"
          sx={{
            height: 28,
            width: 160,
            mx: "auto",
            mt: 2,
            background:
              "repeating-linear-gradient(90deg, #202020 0 2px, transparent 2px 4px, #202020 4px 5px, transparent 5px 8px, #202020 8px 11px, transparent 11px 13px)",
          }}
        />
        <Typography>{`01 0000 ${number}`}</Typography>
      </Box>
    </Box>
  )
}
