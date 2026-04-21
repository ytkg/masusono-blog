import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import kotobaImage from "./assets/recommended-articles/7149ji78dg2w.webp"
import yohakuImage from "./assets/recommended-articles/h7yiloouf_kh.webp"
import pineburgImage from "./assets/recommended-articles/zm5_f8m7vw.webp"

const recommendedArticles = [
  {
    title: "言葉は本当に本心を表しているのか",
    reason: "読書感想から、自分の言葉や感情への違和感まで掘り下げた一本\n考える余韻が残る",
    href: "/blog/7149ji78dg2w",
    image: kotobaImage,
    imageAlt: "本と言葉をイメージしたアイキャッチ",
  },
  {
    title: "余白とは、愛なのかもしれない",
    reason: "転職後の葛藤と気づきを、まっすぐ丁寧に書いた記事\n読後に少し心が軽くなる",
    href: "/blog/h7yiloouf_kh",
    image: yohakuImage,
    imageAlt: "余白と歩みをイメージしたアイキャッチ",
  },
  {
    title: "パインバーグディッシュ",
    reason: "軽いテーマなのに、ちゃんと読み物として楽しい記事\n肩の力を抜いて読めるおすすめ回",
    href: "/blog/zm5_f8m7vw",
    image: pineburgImage,
    imageAlt: "パインバーグディッシュをイメージしたアイキャッチ",
  },
]

export default function HomeRecommendedArticles() {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography variant="h6" component="h3">
        おすすめ記事
      </Typography>
      <Typography variant="body2" color="text.secondary">
        読後感、ブログらしさ、入りやすさでAIが選定
      </Typography>

      <Box sx={{ display: "grid", gap: 1, mt: 0.5 }}>
        {recommendedArticles.map((article) => (
          <Paper
            key={article.href}
            component={Link}
            href={article.href}
            prefetch
            variant="outlined"
            sx={{
              p: 1.25,
              display: "grid",
              gap: 1,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Typography component="span" variant="body1" sx={{ lineHeight: 1.5 }}>
              {article.title}
            </Typography>
            <Box
              sx={{
                alignItems: "center",
                display: "grid",
                gap: 1.25,
                gridTemplateColumns: { xs: "72px minmax(0, 1fr)", sm: "96px minmax(0, 1fr)" },
                minWidth: 0,
              }}
            >
              <Box
                component="img"
                src={article.image}
                alt={article.imageAlt}
                loading="lazy"
                sx={{
                  aspectRatio: "1 / 1",
                  borderRadius: 1,
                  display: "block",
                  height: "auto",
                  objectFit: "cover",
                  width: "100%",
                }}
              />
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.65, whiteSpace: "pre-line" }}
              >
                {article.reason}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Paper>
  )
}
