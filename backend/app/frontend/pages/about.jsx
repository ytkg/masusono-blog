import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import PageContainer from "../shared/PageContainer"
import SeoHead from "../shared/SeoHead"

export default function About() {
  return (
    <>
      <SeoHead
        title="「増田とその他！」について"
        description="飲み仲間3人による、日常をゆるく綴るプロジェクト「増田とその他！」の紹介ページです。"
        canonicalPath="/about"
      />

      <PageContainer component="article" id="about">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          「増田とその他！」について
        </Typography>

        <Typography component="p" sx={{ mb: 2 }}>
          <strong>「増田とその他！」</strong> は、飲み仲間3人による、ゆるくて等身大な日常を綴るプロジェクトです。
        </Typography>

        <Typography component="p" sx={{ mb: 2 }}>
          中心となるのは、実在の人物・<strong>増田愛美</strong>。そして彼女を取り巻く “その他！” の2人、
          <strong>チャーリー</strong> と <strong>上ちゃん</strong>
          。この3人が、まるで居酒屋のカウンターで話しているようなテンションで、日々の出来事や考えたことを交代で書いています。
        </Typography>

        <Typography component="p" sx={{ mb: 2 }}>
          特定のテーマや目的はなく、「飲んだときの話の延長」のような、ざっくばらんな内容ばかり。誰かに届けるというよりは、「気軽にのぞいて、ちょっと笑ってもらえたら嬉しい」そんな空気感で続けています。
        </Typography>

        <Typography component="p" sx={{ mb: 2 }}>
          公式サイト{" "}
          <a href="https://masusono.com" target="_blank" rel="noreferrer">
            masusono.com
          </a>{" "}
          では、日常のブログを中心に、ちょっとしたゲームやおすすめの <strong>居酒屋・ラーメン屋紹介ページ</strong>{" "}
          なども用意しています。
        </Typography>

        <Box
          component="blockquote"
          sx={{
            borderLeft: "4px solid",
            borderColor: "divider",
            pl: 2,
            py: 1,
            my: 3,
            fontStyle: "italic",
            color: "text.secondary",
          }}
        >
          一言でいえば、「飲み仲間たちのゆるい日記」。
        </Box>

        <Typography component="p" sx={{ mb: 0 }}>
          仕事帰りの一杯のように、気楽に立ち寄ってもらえる場所を目指しています。
        </Typography>
      </PageContainer>
    </>
  )
}
