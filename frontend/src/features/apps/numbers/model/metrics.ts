export type MetricBlock = {
  label: string
  value: string | null
  children?: MetricBlock[]
}

export type MetricsResponse = {
  blocks: MetricBlock[]
}
