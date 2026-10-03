export const flattenMetricRows = (blocks, depth = 0, prefix = "") =>
  blocks.flatMap((block, index) => {
    const id = `${prefix}-${index}`
    const node = { id, label: block.label, value: block.value, depth }
    const children = block.children ? flattenMetricRows(block.children, depth + 1, id) : []
    return [node, ...children]
  })
