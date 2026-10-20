export default function Storefront() {
  return (
    <svg
      viewBox="0 0 360 140"
      width="300"
      height="120"
      role="img"
      aria-label="深夜も明るいコンビニと買い物カゴ"
      style={{ maxWidth: "100%", margin: "0 auto" }}
    >
      <path d="M315 12a17 17 0 1 0 19 23 19 19 0 0 1-19-23" fill="#ffe787" />
      <path d="m42 18 2 5 5 2-5 2-2 5-2-5-5-2 5-2m241 23 2 5 5 2-5 2-2 5-2-5-5-2 5-2" fill="#fff8e4" />
      <rect x="60" y="48" width="204" height="79" rx="7" fill="#fff1c9" stroke="#dfad75" strokeWidth="4" />
      <rect x="57" y="26" width="210" height="25" rx="5" fill="#7de0ca" />
      <path d="M60 55h204l9 19H51Z" fill="#ff8d77" />
      {[70, 110, 150, 190, 230].map((x) => (
        <path key={x} d={`M${x} 55h18l3 19h-24Z`} fill="#fff8e4" />
      ))}
      <rect x="78" y="82" width="64" height="33" rx="3" fill="#6ac7cf" />
      <path d="M84 101h52m-52 8h52" stroke="#fff8e4" strokeWidth="3" />
      <rect x="158" y="78" width="39" height="49" rx="2" fill="#6ac7cf" />
      <path d="M178 79v48" stroke="#fff8e4" strokeWidth="3" />
      <circle cx="186" cy="103" r="2" fill="#fff8e4" />
      <rect x="211" y="82" width="34" height="33" rx="3" fill="#ffe787" />
      <path d="M50 130h227" stroke="#dfad75" strokeWidth="6" strokeLinecap="round" />
      <path
        d="m281 93 7 34h45l9-34Zm12 0 6-16m20 16-6-16"
        fill="#ffcf75"
        stroke="#dfad75"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M300 102v15m12-15v15m12-15v15" stroke="#b98252" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
