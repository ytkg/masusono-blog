import { useCallback, useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import ButtonBase from "@mui/material/ButtonBase"
import Typography from "@mui/material/Typography"
import type { SxProps, Theme } from "@mui/material/styles"
import { keyframes } from "@emotion/react"
import defaultImage from "../assets/aimi.png"

interface Props {
  src?: string
  alt?: string
  onClick?: () => void
  height?: number | string | { xs?: number | string; sm?: number | string; md?: number | string }
  sx?: SxProps<Theme>
  ouchText?: string
}

export default function Aimi({
  src = defaultImage,
  alt = "",
  onClick,
  height = { xs: 112, sm: 128 },
  sx,
  ouchText = "痛い！",
}: Props) {
  type Pop = { id: number; mode: "left" | "right" | "top"; y: number; x?: number }
  const [pops, setPops] = useState<Pop[]>([])
  const timersRef = useRef<number[]>([])
  const idRef = useRef(0)
  const wrapRef = useRef<HTMLDivElement | null>(null)

  // 動きは無し（フェードイン・アウトのみ）
  const fadeInOut = keyframes({
    "0%": { opacity: 0 },
    "20%": { opacity: 1 },
    "100%": { opacity: 0 },
  })

  const handleClick = useCallback(() => {
    const rect = wrapRef.current?.getBoundingClientRect()
    const h = rect?.height ?? 128
    const w = rect?.width ?? 128
    const y = Math.max(10, Math.min(h - 10, Math.random() * h))
    const x = Math.max(10, Math.min(w - 10, Math.random() * w))
    // 左・右・上のいずれか
    const r = Math.random()
    const mode: Pop["mode"] = r < 0.33 ? "left" : r < 0.66 ? "right" : "top"
    const id = ++idRef.current
    setPops((prev) => [...prev, { id, mode, y, x }])
    const t = window.setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== id))
    }, 1200)
    timersRef.current.push(t)
    onClick?.()
  }, [onClick])

  useEffect(
    () => () => {
      // アンマウント時にタイマーをクリア
      timersRef.current.forEach((t) => {
        window.clearTimeout(t)
      })
      timersRef.current = []
    },
    [],
  )

  const Img = (
    <Box
      component="img"
      src={src}
      alt={alt}
      draggable={false}
      sx={{
        height,
        display: "block",
        userSelect: "none",
        willChange: "transform",
        transform: "translateZ(0)",
        transition: "transform 120ms ease, filter 120ms ease",
      }}
    />
  )

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        WebkitTapHighlightColor: "transparent",
        ...sx,
      }}
    >
      <Box ref={wrapRef} sx={{ position: "relative", display: "inline-block", lineHeight: 0 }}>
        <ButtonBase
          onClick={handleClick}
          disableRipple
          disableTouchRipple
          sx={{
            p: 0,
            borderRadius: 1,
            WebkitTapHighlightColor: "transparent",
            "&:active img": { transform: "scale(0.98)", filter: "brightness(0.98)" },
          }}
          aria-label={alt || undefined}
        >
          {Img}
        </ButtonBase>
        {pops.map((p) => (
          <Typography
            key={p.id}
            variant="subtitle1"
            sx={{
              position: "absolute",
              ...(p.mode === "top"
                ? {
                    top: 0,
                    left: `${p.x}px`,
                    transform: "translate(-50%, -100%)",
                  }
                : p.mode === "right"
                  ? { top: `${p.y}px`, left: "calc(100% + 8px)", transform: "translateY(-50%)" }
                  : { top: `${p.y}px`, right: "calc(100% + 8px)", transform: "translateY(-50%)" }),
              color: "text.primary",
              fontWeight: 700,
              textShadow: "0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(0,0,0,0.25)",
              pointerEvents: "none",
              animation: `${fadeInOut} 1200ms ease-out forwards`,
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            {ouchText}
          </Typography>
        ))}
      </Box>
    </Box>
  )
}
