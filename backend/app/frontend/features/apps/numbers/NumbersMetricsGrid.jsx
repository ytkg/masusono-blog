import { Fragment } from "react"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"

const blocksGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 2,
}

const childRowsGridSx = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  columnGap: 2,
  rowGap: 1.25,
}

const indentSx = [{ pl: 2 }, { pl: 4 }, { pl: 6 }]
const valueSx = { fontWeight: 700, fontSize: "22px", textAlign: "right", justifySelf: "end" }
const labelTextSx = { fontSize: "14px" }

const flattenMetricRows = (blocks, depth = 0, prefix = "") =>
  blocks.flatMap((block, index) => {
    const id = `${prefix}-${index}`
    const node = { id, label: block.label, value: block.value, depth }
    const children = block.children ? flattenMetricRows(block.children, depth + 1, id) : []
    return [node, ...children]
  })

function MetricRowList({ rows }) {
  return (
    <Box sx={childRowsGridSx}>
      {rows.map((row) => (
        <Fragment key={row.id}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ ...labelTextSx, ...(indentSx[row.depth] ?? indentSx[indentSx.length - 1]) }}
          >
            {row.label}
          </Typography>
          <Typography variant="h4" sx={valueSx}>
            {row.value ?? "—"}
          </Typography>
        </Fragment>
      ))}
    </Box>
  )
}

function MetricCard({ block }) {
  const rows = flattenMetricRows(block.children ?? [])
  const hasRows = rows.length > 0
  const showValue = !hasRows || Boolean(block.value)

  return (
    <Card variant="outlined" sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, py: 1.5 }}>
        <Typography variant="overline" color="text.secondary" sx={labelTextSx}>
          {block.label}
        </Typography>
        {showValue ? (
          <Typography variant="h4" sx={valueSx}>
            {block.value ?? "—"}
          </Typography>
        ) : null}
        {hasRows ? <MetricRowList rows={rows} /> : null}
      </CardContent>
    </Card>
  )
}

export default function NumbersMetricsGrid({ blocks }) {
  return (
    <Box sx={blocksGridSx}>
      {blocks.map((block) => (
        <MetricCard key={block.label} block={block} />
      ))}
    </Box>
  )
}
