export type Metric = { label: string; value: string }
export type MetricGroup = { label: string; value: string; children: Metric[] }
export type MetricBlock = { kind: "single"; metric: Metric } | { kind: "group"; label: string; groups: MetricGroup[] }
export type MetricsResponse = { blocks: MetricBlock[] }
