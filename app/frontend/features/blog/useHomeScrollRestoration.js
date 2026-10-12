import { useEffect, useLayoutEffect } from "react"
import { router } from "@inertiajs/react"

export default function useHomeScrollRestoration({ scrollY, stateRef, commit }) {
  useEffect(
    () =>
      router.on("before", ({ detail: { visit } }) => {
        if (!visit.prefetch && !visit.async) commit({ ...stateRef.current, scrollY: window.scrollY })
      }),
    [commit, stateRef],
  )

  useLayoutEffect(() => {
    if (!scrollY) return
    // Let the remembered list mount and Inertia's own animation-frame restore finish first.
    let frame = window.requestAnimationFrame(() => {
      frame = window.requestAnimationFrame(() => window.scrollTo({ top: scrollY }))
    })
    return () => window.cancelAnimationFrame(frame)
  }, [scrollY])
}
