import { useEffect, useState } from "react"

const PHRASE = "増田とその他と、私の体調"
const BLOCKS = "p,div,li,h1,h2,h3,h4,h5,h6,blockquote,pre,td,th,button,label"

export function findHealthPhraseRanges(root) {
  const matches = []
  let nodes = []
  let block

  function collect() {
    const text = nodes.map((node) => node.data).join("")
    for (let index = text.indexOf(PHRASE); index !== -1; index = text.indexOf(PHRASE, index + PHRASE.length)) {
      const range = document.createRange()
      const parents = []
      let offset = 0
      for (const node of nodes) {
        const end = offset + node.length
        if (offset <= index && index < end) range.setStart(node, index - offset)
        if (end > index && offset < index + PHRASE.length) parents.push(node.parentElement)
        if (offset < index + PHRASE.length && index + PHRASE.length <= end) {
          range.setEnd(node, index + PHRASE.length - offset)
          break
        }
        offset = end
      }
      matches.push({ range, parents })
    }
    nodes = []
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement
    if (!parent || parent.closest("header,script,style,noscript,template")) continue
    const nextBlock = parent.closest(BLOCKS) || parent
    if (nextBlock !== block) collect()
    block = nextBlock
    nodes.push(node)
  }
  collect()
  return matches
}

function isVisible({ range, parents }) {
  for (const parent of parents) {
    for (let element = parent; element; element = element.parentElement) {
      const style = getComputedStyle(element)
      if (
        element.hidden ||
        element.inert ||
        element.getAttribute("aria-hidden") === "true" ||
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.visibility === "collapse" ||
        style.opacity === "0"
      )
        return false
    }
  }
  return Array.from(range.getClientRects()).some((rect) => {
    const left = Math.max(0, rect.left)
    const right = Math.min(window.innerWidth, rect.right)
    const top = Math.max(0, rect.top)
    const bottom = Math.min(window.innerHeight, rect.bottom)
    if (right <= left || bottom <= top) return false
    // Test the visible text itself so fixed headers, navigation and overlays do not count as visibility.
    return [left + 0.5, (left + right) / 2, right - 0.5].some((x) =>
      [top + 0.5, (top + bottom) / 2, bottom - 0.5].some((y) => {
        const hit = document.elementFromPoint(x, y)
        return hit && parents.some((parent) => parent.contains(hit))
      }),
    )
  })
}

export default function useVisibleHealthPhrase() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    let frame
    let ranges = []
    let dirty = true
    function update() {
      frame = undefined
      if (dirty) {
        ranges = findHealthPhraseRanges(document.body)
        dirty = false
      }
      setVisible(ranges.some(isVisible))
    }
    function schedule() {
      if (frame === undefined) frame = requestAnimationFrame(update)
    }
    const observer = new MutationObserver(() => {
      dirty = true
      schedule()
    })
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "hidden", "inert", "aria-hidden", "open"],
    })
    const resizeObserver = window.ResizeObserver ? new ResizeObserver(schedule) : null
    resizeObserver?.observe(document.body)
    window.addEventListener("scroll", schedule, true)
    window.addEventListener("resize", schedule)
    document.fonts?.addEventListener("loadingdone", schedule)
    schedule()
    return () => {
      observer.disconnect()
      resizeObserver?.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule, true)
      window.removeEventListener("resize", schedule)
      document.fonts?.removeEventListener("loadingdone", schedule)
    }
  }, [])
  return visible
}
