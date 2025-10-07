import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import { keyframes } from '@emotion/react'
import defaultImage from '../assets/aimi.png'

interface Props {
  src?: string
  alt?: string
  onClick?: () => void
  height?: number | string | { xs?: number | string; sm?: number | string; md?: number | string }
  sx?: SxProps<Theme>
  ouchText?: string
}

export default function FooterImage({
  src = defaultImage,
  alt = '',
  onClick,
  height = { xs: 112, sm: 128 },
  sx,
  ouchText = '痛い！',
}: Props) {
  const [pops, setPops] = useState<Array<{ id: number; left: number; offset: number }>>([])
  const timersRef = useRef<number[]>([])
  const idRef = useRef(0)

  const floatOut = keyframes({
    '0%': { opacity: 0, transform: 'translate(-50%, -100%) translateY(8px)' },
    '20%': { opacity: 1 },
    // 以前より高く浮かせる
    '100%': { opacity: 0, transform: 'translate(-50%, -100%) translateY(-36px)' },
  })

  const handleClick = () => {
    // ランダムな左右位置（20%〜80%）に表示
    const left = 20 + Math.random() * 60
    // ランダムな縦オフセット（より広範囲・高めまで）
    const offset = 30 + Math.random() * 150 // 30px〜180px 上に
    const id = ++idRef.current
    setPops((prev) => [...prev, { id, left, offset }])
    const t = window.setTimeout(() => {
      setPops((prev) => prev.filter((p) => p.id !== id))
    }, 1200)
    timersRef.current.push(t)
    onClick?.()
  }

  useEffect(() => () => {
    // アンマウント時にタイマーをクリア
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
  }, [])

  const Img = (
    <Box
      component="img"
      src={src}
      alt={alt}
      draggable={false}
      sx={{
        height,
        display: 'block',
        userSelect: 'none',
        willChange: 'transform',
        transform: 'translateZ(0)',
        transition: 'transform 120ms ease, filter 120ms ease',
      }}
    />
  )

  return (
    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', WebkitTapHighlightColor: 'transparent', ...sx }}>
      {onClick ? (
        <ButtonBase
          onClick={handleClick}
          disableRipple
          disableTouchRipple
          sx={{
            p: 0,
            borderRadius: 1,
            WebkitTapHighlightColor: 'transparent',
            '&:active img': { transform: 'scale(0.98)', filter: 'brightness(0.98)' },
          }}
          aria-label={alt || undefined}
        >
          {Img}
        </ButtonBase>
      ) : (
        <ButtonBase
          onClick={handleClick}
          disableRipple
          disableTouchRipple
          sx={{
            p: 0,
            borderRadius: 1,
            WebkitTapHighlightColor: 'transparent',
            '&:active img': { transform: 'scale(0.98)', filter: 'brightness(0.98)' },
          }}
          aria-label={alt || undefined}
        >
          {Img}
        </ButtonBase>
      )}
      {pops.map((p) => (
        <Typography
          key={p.id}
          variant="subtitle1"
          sx={{
            position: 'absolute',
            top: -p.offset,
            left: `${p.left}%`,
            transform: 'translate(-50%, -100%)',
            color: 'text.primary',
            fontWeight: 700,
            textShadow: '0 1px 0 rgba(255,255,255,0.8), 0 1px 4px rgba(0,0,0,0.25)',
            pointerEvents: 'none',
            animation: `${floatOut} 1200ms ease-out forwards`,
            userSelect: 'none',
          }}
        >
          {ouchText}
        </Typography>
      ))}
    </Box>
  )
}
