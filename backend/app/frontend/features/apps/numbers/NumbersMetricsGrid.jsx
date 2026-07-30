import { Fragment } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const childRowsGridSx = Object.freeze({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  columnGap: 2,
  rowGap: 1.25,
})

const indentSx = [{ pl: 2 }, { pl: 2 }, { pl: 4 }]
const valueSx = { fontWeight: 700, fontSize: "22px", textAlign: "right", justifySelf: "end" }
const childValueSx = { fontWeight: 700, fontSize: "17px", textAlign: "right", justifySelf: "end" }
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
      {rows.map((row) => {
        const isPrimaryRow = row.depth === 0

        return (
          <Fragment key={row.id}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ...labelTextSx, ...(indentSx[row.depth] ?? indentSx[indentSx.length - 1]) }}
            >
              {row.label}
            </Typography>
            <Typography variant={isPrimaryRow ? "h4" : "body1"} sx={isPrimaryRow ? valueSx : childValueSx}>
              {row.value ?? "—"}
            </Typography>
          </Fragment>
        )
      })}
    </Box>
  )
}

function MetricCard({ block, isLast }) {
  const rows = flattenMetricRows(block.children ?? [], block.value ? 1 : 0)
  const hasRows = rows.length > 0
  const showValue = !hasRows || Boolean(block.value)

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.25,
        py: 2,
        borderBottom: isLast ? "none" : "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 2, alignItems: "baseline" }}>
        <Typography variant="overline" color="text.secondary" sx={labelTextSx}>
          {block.label}
        </Typography>
        {showValue ? (
          <Typography variant="h4" sx={valueSx}>
            {block.value ?? "—"}
          </Typography>
        ) : null}
      </Box>
      {hasRows ? <MetricRowList rows={rows} /> : null}
    </Box>
  )
}

export default function NumbersMetricsGrid({ blocks }) {
  return (
    <Box>
      {blocks.map((block, index) => (
        <MetricCard key={block.label} block={block} isLast={index === blocks.length - 1} />
      ))}
    </Box>
  )
}
