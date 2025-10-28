import type { SxProps, Theme } from '@mui/material/styles'

export function mergeSx(base?: SxProps<Theme>, extra?: SxProps<Theme>): SxProps<Theme> {
  const baseArray = normalize(base)
  const extraArray = normalize(extra)
  if (!baseArray.length) return extraArray as SxProps<Theme>
  if (!extraArray.length) return baseArray as SxProps<Theme>
  return [...baseArray, ...extraArray] as SxProps<Theme>
}

function normalize(value?: SxProps<Theme>) {
  if (Array.isArray(value)) return value
  if (value == null) return []
  return [value]
}
