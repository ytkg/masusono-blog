import { Fragment } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const childRowsGridSx = Object.freeze({
  display: "grid",
  gridTemplateColumns: "1fr auto",
  columnGap: 2,
  rowGap: 1.25,
})

const indentSx = Object.freeze([Object.freeze({ pl: 2 }), Object.freeze({ pl: 2 }), Object.freeze({ pl: 4 })])
const valueSx = Object.freeze({ fontWeight: 700, fontSize: "22px", textAlign: "right", justifySelf: "end" })
const childValueSx = { fontWeight: 700, fontSize: "17px", textAlign: "right", justifySelf: "end" }
const labelTextSx = { fontSize: "14px", lineHeight: 1.5, letterSpacing: 0, fontWeight: 400 }
const primaryLabelTextSx = { ...labelTextSx, fontWeight: 700 }

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
              variant="body2"
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

function MetricCard({ block }) {
  const rows = flattenMetricRows(block.children ?? [], block.value ? 1 : 0)
  const hasRows = rows.length > 0
  const showValue = !hasRows || Boolean(block.value)

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.25,
        p: 3,
        bgcolor: "background.paper",
        borderTop: "4px solid",
        borderColor: "primary.main",
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 2, alignItems: "baseline" }}>
        <Typography variant="body2" color="text.secondary" sx={primaryLabelTextSx}>
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
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 3 }}>
      {blocks.map((block) => (
        <MetricCard key={block.label} block={block} />
      ))}
    </Box>
  )
}
