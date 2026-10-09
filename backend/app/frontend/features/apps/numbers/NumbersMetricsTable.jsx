import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"

export default function NumbersMetricsTable({ rows }) {
  return (
    <TableContainer tabIndex={0} role="region" aria-label="記事の指標（横スクロールできます）">
      <Table aria-label="対象別の記事の指標" sx={{ minWidth: 480, "& th, & td": { whiteSpace: "nowrap" } }}>
        <TableHead>
          <TableRow>
            <TableCell scope="col">対象</TableCell>
            <TableCell scope="col" align="right">
              総記事数
            </TableCell>
            <TableCell scope="col" align="right">
              総文字数
            </TableCell>
            <TableCell scope="col" align="right">
              平均文字数
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.label}
              sx={index === 0 ? { bgcolor: "action.hover", "& th, & td": { fontWeight: 700 } } : undefined}
            >
              <TableCell component="th" scope="row">
                {row.label}
              </TableCell>
              <TableCell align="right">{row.articles}</TableCell>
              <TableCell align="right">{row.chars}</TableCell>
              <TableCell align="right">{row.averageChars}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
