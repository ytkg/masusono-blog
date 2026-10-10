import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { IMAGES } from "./assets"
import { HoleArt } from "./TatakiFieldArt"

// 顔の大きさと中心を揃え、元写真の透明な余白を調整する。
const PORTRAITS = [
  { width: "80%", left: "13%", top: "-12%" },
  { width: "100%", left: "-4%", top: "2%" },
  { width: "96%", left: "24%", top: "2%" },
]

export default function MasudaTatakiHole({ character, index, elapsed, onTap }) {
  return (
    <Box
      component="button"
      type="button"
      aria-label={`穴${index + 1}${character && !character.hit ? (character.kind === "masuda" ? " 増田" : " その他") : ""}`}
      onPointerDown={(event) => {
        event.preventDefault()
        onTap(index)
      }}
      onClick={(event) => {
        if (event.detail === 0) onTap(index)
      }}
      sx={{
        position: "relative",
        aspectRatio: "1",
        border: 0,
        borderRadius: 2,
        background: "transparent",
        p: 0,
        overflow: "hidden",
        cursor: "pointer",
        touchAction: "none",
        WebkitTapHighlightColor: "transparent",
        "&:focus-visible": { outline: "3px solid", outlineColor: "primary.main" },
        "@keyframes emerge": { from: { transform: "translateY(90%)" }, to: { transform: "translateY(0)" } },
      }}
    >
      <HoleArt />
      {character && (
        <Box
          sx={{
            position: "absolute",
            inset: "0 0 25%",
            overflow: "hidden",
            borderRadius: "0 0 20% 20% / 0 0 45% 45%",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              animation: "emerge 120ms ease-out",
              transform: character.hit
                ? "scaleY(.45) rotate(-10deg)"
                : character.until - elapsed < 120
                  ? "translateY(90%)"
                  : "none",
              transformOrigin: "bottom",
              transition: "transform 100ms ease",
              "@media (prefers-reduced-motion: reduce)": { animation: "none", transition: "none" },
            }}
          >
            <Box
              component="img"
              src={IMAGES[character.image]}
              alt=""
              draggable={false}
              sx={{ position: "absolute", height: "auto", maxWidth: "none", ...PORTRAITS[character.image] }}
            />
          </Box>
        </Box>
      )}
      <HoleArt foreground />
      {character?.hit && (
        <Typography
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            fontSize: 24,
            zIndex: 3,
            textShadow: "0 1px 2px white",
            color: character.points > 0 ? "success.main" : "error.main",
            bgcolor: "transparent",
          }}
        >
          {character.points > 0 ? "+" : ""}
          {character.points}
        </Typography>
      )}
    </Box>
  )
}
