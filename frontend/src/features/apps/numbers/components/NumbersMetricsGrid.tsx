import { Fragment } from "react"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import type { Metric, MetricBlock, MetricGroup } from "@/types/metrics"

type NumbersMetricsGridProps = {
  blocks: MetricBlock[]
}

const blocksGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 2,
}

const groupGridSx = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  columnGap: 2,
  rowGap: 1.25,
}

const labelIndentSx = {
  parent: { pl: 2 },
  child: { pl: 4 },
} as const
const valueSx = { fontWeight: 700, fontSize: "22px", textAlign: "right" as const, justifySelf: "end" as const }
const labelTextSx = { fontSize: "14px" }

type GroupRow = {
  id: string
  label: string
  value: string
  indent: "parent" | "child"
}

const buildGroupRows = (groups: MetricGroup[]): GroupRow[] =>
  groups.flatMap((group, groupIndex) => [
    {
      id: `group-${groupIndex}`,
      label: group.label,
      value: group.value,
      indent: "parent" as const,
    },
    ...group.children.map((child, childIndex) => ({
      id: `group-${groupIndex}-child-${childIndex}`,
      label: child.label,
      value: child.value,
      indent: "child" as const,
    })),
  ])

function SingleMetricCard({ metric }: { metric: Metric }) {
  return (
    <Card variant="outlined" sx={{ height: "100%", gridColumn: { xs: "auto", sm: "1 / -1" } }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1, py: 1.5 }}>
        <Typography variant="overline" color="text.secondary" sx={labelTextSx}>
          {metric.label}
        </Typography>
        <Typography variant="h4" sx={valueSx}>
          {metric.value}
        </Typography>
      </CardContent>
    </Card>
  )
}

function GroupMetricCard({ label, groups }: { label: string; groups: MetricGroup[] }) {
  const rows = buildGroupRows(groups)
  return (
    <Card variant="outlined" sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, py: 1.5 }}>
        <Typography variant="overline" color="text.secondary" sx={labelTextSx}>
          {label}
        </Typography>
        <Box sx={groupGridSx}>
          {rows.map((row) => (
            <Fragment key={row.id}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ...labelTextSx, ...labelIndentSx[row.indent] }}
              >
                {row.label}
              </Typography>
              <Typography variant="h4" sx={valueSx}>
                {row.value}
              </Typography>
            </Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default function NumbersMetricsGrid({ blocks }: NumbersMetricsGridProps) {
  return (
    <Box sx={blocksGridSx}>
      {blocks.map((block) => {
        if (block.kind === "group") {
          return <GroupMetricCard key={block.label} label={block.label} groups={block.groups} />
        }
        return <SingleMetricCard key={block.metric.label} metric={block.metric} />
      })}
    </Box>
  )
}
