import { Link } from "@inertiajs/react"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

const recommendedArticles = [
  {
    title: "言葉は本当に本心を表しているのか",
    reason: "読書感想から、自分の言葉や感情への違和感まで掘り下げた一本\n考える余韻が残る",
    href: "/blog/7149ji78dg2w",
  },
  {
    title: "余白とは、愛なのかもしれない",
    reason: "転職後の葛藤と気づきを、まっすぐ丁寧に書いた記事\n読後に少し心が軽くなる",
    href: "/blog/h7yiloouf_kh",
  },
  {
    title: "パインバーグディッシュ",
    reason: "軽いテーマなのに、ちゃんと読み物として楽しい記事\n肩の力を抜いて読めるおすすめ回",
    href: "/blog/zm5_f8m7vw",
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
              gap: 0.25,
              color: "inherit",
              textDecoration: "none",
            }}
          >
            <Typography component="span" variant="body1" sx={{ lineHeight: 1.5 }}>
              {article.title}
            </Typography>
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.65, whiteSpace: "pre-line" }}
            >
              {article.reason}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Paper>
  )
}
