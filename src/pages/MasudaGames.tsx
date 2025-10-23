import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import PageContainer from '../components/PageContainer'
import FeatureLinkCard from '../components/FeatureLinkCard'
import { usePageMeta } from '../hooks/usePageMeta'

const games = [
  {
    label: '増田RUN',
    description: 'ジャンプで障害物を避けるラン系アクション。',
    to: '/games/run',
  },
  {
    label: '増田崩し',
    description: 'バーでボールを弾いてブロックを全消しするクラシックアクション。',
    to: '/games/kuzushi',
  },
]

export default function MasudaGames() {
  usePageMeta({
    title: '増田ゲーム',
    description: '増田RUNや増田崩しなど、増田とその他！オリジナルのミニゲームをまとめています。',
    canonicalPath: '/games',
  })

  return (
    <PageContainer>
      <Typography variant="h5" component="h1" gutterBottom>
        増田ゲーム
      </Typography>

      <Stack spacing={2}>
        {games.map((game) => (
          <FeatureLinkCard key={game.to} title={game.label} description={game.description} to={game.to} />
        ))}
      </Stack>
    </PageContainer>
  )
}
