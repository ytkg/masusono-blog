import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"

const TOP_RANKINGS_LIMIT = 10
const containerSx = { border: "1px solid", borderColor: "divider", borderRadius: 1, p: 2 }
const titleSx = { mb: 1 }
const monoSx = { fontVariantNumeric: "tabular-nums" }

const formatScore = (score) => Math.floor(score).toLocaleString("ja-JP")

export default function MasudaRunRankings({ rankings, isLoading, hasError }) {
  const topRankings = rankings?.slice(0, TOP_RANKINGS_LIMIT) ?? []

  return (
    <Box sx={containerSx}>
      <Typography variant="subtitle1" sx={titleSx}>
        ランキング
      </Typography>
      {isLoading && topRankings.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          読み込み中...
        </Typography>
      ) : null}
      {hasError ? (
        <Typography variant="body2" color="text.secondary">
          ランキングの取得に失敗しました。
        </Typography>
      ) : null}
      {!isLoading && !hasError && topRankings.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          まだランキングがありません。
        </Typography>
      ) : null}
      {topRankings.length > 0 ? (
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
      ) : null}
    </Box>
  )
}
