import Box from "@mui/material/Box"
import Button from "@mui/material/Button"

// 初期版は固定掲載。将来の配信方式が決まったら、この広告単位で差し替える。
const ad = {
  href: "/articles/zm5_f8m7vw",
  image: "/images/ads/pine-burg-dish.png",
  alt: "パインを載せたハンバーグとご飯の水彩画",
  heading: "あなたは、のせる派？",
  description: "パインバーグディッシュをめぐる、ある日の話。",
}

export default function MasusonoAd() {
  return (
    <Box
      component="article"
      aria-label="Masusono Ads"
      sx={{
        mt: 4,
        mx: "auto",
        width: "100%",
        maxWidth: 480,
        overflow: "hidden",
        border: 1,
        borderColor: "divider",
        borderRadius: "16px",
        bgcolor: "background.paper",
        color: "text.primary",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", p: "10px 14px" }}>
        <Box
          aria-hidden="true"
          sx={{
            width: 32,
            height: 32,
            display: "grid",
            placeItems: "center",
            borderRadius: "8px",
            bgcolor: "action.hover",
            fontSize: 18,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          増
        </Box>
        <Box sx={{ lineHeight: 1.5 }}>
          <Box component="strong" sx={{ display: "block", fontSize: 14, fontWeight: 600 }}>
            増田とその他！
          </Box>
          <Box component="span" sx={{ display: "block", fontSize: 12, color: "text.secondary" }}>
            masusono.com
          </Box>
        </Box>
        <Box
          component="span"
          sx={{
            ml: "auto",
            p: "3px 6px",
            fontSize: 11,
            border: 1,
            borderColor: "divider",
            borderRadius: "3px",
            color: "text.secondary",
            flexShrink: 0,
          }}
        >
          広告
        </Box>
      </Box>
      <Box
        component="img"
        src={ad.image}
        alt={ad.alt}
        width={1280}
        height={800}
        sx={{
          display: "block",
          width: "100%",
          height: "clamp(130px, 40vw, 180px)",
          objectFit: "cover",
          objectPosition: "center 55%",
        }}
      />
      <Box sx={{ p: "14px 16px", "@media(max-width:380px)": { p: "12px 14px" } }}>
        <Box
          component="h2"
          sx={{
            m: "0 0 6px",
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: ".02em",
            lineHeight: 1.4,
            overflowWrap: "anywhere",
            "@media(max-width:380px)": { fontSize: 22 },
          }}
        >
          {ad.heading}
        </Box>
        <Box component="p" sx={{ m: "0 0 12px", fontSize: 14, lineHeight: 1.6, color: "text.secondary" }}>
          {ad.description}
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}
        >
          <Box component="span" sx={{ fontSize: 11, color: "text.secondary" }}>
            Masusono Ads
          </Box>
          <Button
            href={ad.href}
            sx={{
              minHeight: 44,
              p: "10px 16px",
              borderRadius: "8px",
              bgcolor: "action.hover",
              color: "text.primary",
              fontSize: 14,
              fontWeight: 600,
              "&:hover": { bgcolor: "action.selected" },
              "&:focus-visible": { outline: "2px solid", outlineOffset: 2 },
            }}
          >
            記事を読む
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
