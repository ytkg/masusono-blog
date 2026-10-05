export function smoothPath(points) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`

  const [first, second, ...rest] = points
  const firstMidpoint = midpoint(first, second)
  const commands = [`M ${first.x} ${first.y}`, `Q ${first.x} ${first.y} ${firstMidpoint.x} ${firstMidpoint.y}`]
  let previous = second

  rest.forEach((point) => {
    const nextMidpoint = midpoint(previous, point)
    commands.push(`T ${nextMidpoint.x} ${nextMidpoint.y}`)
    previous = point
  })
  commands.push(`T ${previous.x} ${previous.y}`)

  return commands.join(" ")
}

function midpoint(a, b) {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  }
}
