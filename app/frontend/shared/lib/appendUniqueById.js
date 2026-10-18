export function appendUniqueById(items, moreItems) {
  const ids = new Set(items.map((item) => item.id))
  const added = moreItems.filter((item) => {
    if (ids.has(item.id)) return false
    ids.add(item.id)
    return true
  })
  return [...items, ...added]
}
