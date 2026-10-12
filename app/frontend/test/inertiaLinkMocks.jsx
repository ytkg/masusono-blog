import { forwardRef } from "react"

export const MockInertiaLink = forwardRef(function MockLink({ href, children, ...props }, ref) {
  return (
    <a ref={ref} href={href} {...props}>
      {children}
    </a>
  )
})

export const MockInertiaLinkWithoutPrefetch = forwardRef(function MockLink(
  { href, prefetch: _prefetch, children, ...props },
  ref,
) {
  return (
    <a ref={ref} href={href} {...props}>
      {children}
    </a>
  )
})
