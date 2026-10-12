import Box from "@mui/material/Box"

export function FieldGround() {
  return (
    <Box
      component="svg"
      viewBox="0 0 460 460"
      aria-hidden="true"
      sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id="tataki-soil" x2="0" y2="1">
          <stop stopColor="#efd49a" />
          <stop offset="1" stopColor="#d9ad6d" />
        </linearGradient>
      </defs>
      <rect x="5" y="12" width="450" height="444" rx="36" fill="#997044" />
      <rect x="5" y="5" width="450" height="438" rx="36" fill="url(#tataki-soil)" stroke="#bb8d50" strokeWidth="5" />
      <path
        d="M34 7 Q15 8 11 31 L13 65 Q22 50 31 55 L40 42 L51 49 L62 29 L73 38 L87 15 L101 22 L116 7 Z M344 7 L360 22 L370 14 L386 34 L396 25 L410 49 L420 41 L431 57 L447 66 L450 32 Q446 9 427 7 Z"
        fill="#83a951"
      />
      <path
        d="M23 421 L19 409 L31 415 L37 396 L44 414 L56 405 L51 424 M406 425 L401 410 L411 417 L418 399 L424 416 L435 410 L432 426"
        fill="#709649"
        stroke="#62833b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <g fill="#bd925e" opacity=".7">
        <ellipse cx="28" cy="165" rx="5" ry="3" />
        <ellipse cx="430" cy="293" rx="6" ry="3" />
        <ellipse cx="159" cy="292" rx="4" ry="2" />
        <ellipse cx="301" cy="159" rx="5" ry="2" />
        <ellipse cx="177" cy="420" rx="6" ry="3" />
        <ellipse cx="286" cy="31" rx="4" ry="2" />
      </g>
      <g fill="#f8e4b7">
        <ellipse cx="31" cy="162" rx="4" ry="2" />
        <ellipse cx="433" cy="290" rx="5" ry="2" />
        <ellipse cx="180" cy="417" rx="5" ry="2" />
      </g>
    </Box>
  )
}

export function HoleArt({ foreground = false }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 120 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      sx={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: foreground ? 2 : 0,
      }}
    >
      {foreground ? (
        <path d="M7 73 Q60 110 113 73" fill="none" stroke="#c09558" strokeWidth="8" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx="60" cy="79" rx="54" ry="20" fill="#b08751" opacity=".4" />
          <ellipse cx="60" cy="73" rx="54" ry="22" fill="#b17d43" />
          <ellipse cx="60" cy="72" rx="48" ry="17" fill="#493022" />
          <path d="M13 74 C13 50 107 50 107 74 C95 57 25 57 13 74" fill="#302119" />
          <path d="M8 70 Q19 50 46 52" fill="none" stroke="#f5dfab" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </Box>
  )
}
