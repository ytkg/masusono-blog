import { useLayoutEffect, useRef, useState } from "react"
import { sentenceFeedLayout } from "./sentenceFeedLayout"

export default function useSentenceFeedLayout(items) {
  const containerRef = useRef(null)
  const [height, setHeight] = useState(0)
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || items.length === 0) return undefined

    function layout() {
      const cardElements = Array.from(container.querySelectorAll(".sentence-card"))
      const nextLayout = sentenceFeedLayout({
        containerWidth: container.clientWidth,
        itemHeights: cardElements.map((card) => card.offsetHeight),
        viewportWidth: window.innerWidth,
      })

      cardElements.forEach((card, index) => {
        const { left, top, width } = nextLayout.items[index]
        card.style.width = `${width}px`
        card.style.transform = `translate(${left}px, ${top}px)`
      })
      setHeight(nextLayout.height)
    }

    layout()
    const observer = new ResizeObserver(layout)
    observer.observe(container)
    return () => observer.disconnect()
  }, [items])

  return { containerRef, height }
}
