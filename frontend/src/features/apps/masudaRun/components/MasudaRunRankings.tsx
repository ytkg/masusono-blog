import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import type { MasudaRunRanking } from "@/features/apps/masudaRun/model/ranking"

const TOP_RANKINGS_LIMIT = 10
const containerSx = { border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 } as const
const titleSx = { mb: 1 } as const
const monoSx = { fontVariantNumeric: "tabular-nums" } as const

const formatScore = (score: number) => Math.floor(score).toLocaleString("ja-JP")

type Props = {
  rankings?: MasudaRunRanking[]
  isLoading: boolean
  hasError: boolean
}

export default function MasudaRunRankings({ rankings, isLoading, hasError }: Props) {
  const topRankings = rankings?.slice(0, TOP_RANKINGS_LIMIT) ?? []

  return (
    <Box sx={containerSx}>
      <Typography variant="subtitle1" sx={titleSx}>
        ランキング
      </Typography>
      {isLoading && topRankings.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          読み込み中...
        </Typography>
      )}
      {hasError && (
        <Typography variant="body2" color="text.secondary">
          ランキングの取得に失敗しました。
        </Typography>
      )}
      {!isLoading && !hasError && topRankings.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          まだランキングがありません。
        </Typography>
      )}
      {topRankings.length > 0 && (
        <TableContainer>
          <Table size="small" aria-label="増田RUNランキング">
            <TableHead>
              <TableRow>
                <TableCell>順位</TableCell>
                <TableCell>ユーザー</TableCell>
                <TableCell align="right">スコア</TableCell>
                <TableCell align="right">日付</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topRankings.map((ranking) => (
                <TableRow key={`${ranking.rank}-${ranking.userId}-${ranking.score}`} hover>
                  <TableCell>{ranking.rank}</TableCell>
                  <TableCell>{ranking.userId}</TableCell>
                  <TableCell align="right" sx={monoSx}>
                    {formatScore(ranking.score)}
                  </TableCell>
                  <TableCell align="right" sx={monoSx}>
                    {ranking.rankedAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
