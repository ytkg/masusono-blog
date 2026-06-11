export const articleBodyHtmlSx = {
  color: "text.secondary",
  "& img": { maxWidth: "100%", height: "auto", borderRadius: "12px" },
  "& p": { margin: "0 0 1em" },
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  "& a": {
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    textDecoration: "underline",
  },
  "& pre": {
    bgcolor: "#f7f7f7",
    borderRadius: 2,
    color: "text.primary",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.875rem",
    lineHeight: 1.7,
    m: "0 0 1em",
    overflowX: "auto",
    p: 1.5,
    position: "relative",
    whiteSpace: "pre",
  },
  "& pre[data-code-language]": {
    pt: 3.25,
  },
  "& pre[data-code-language]::before": {
    color: "text.secondary",
    content: "attr(data-code-language)",
    fontFamily: "'M PLUS Rounded 1c', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'YuGothic', Meiryo, system-ui, sans-serif",
    fontSize: "11px",
    fontWeight: 700,
    left: 12,
    lineHeight: 1,
    position: "absolute",
    top: 12,
  },
  "& pre[data-code-language] code": {
    display: "block",
  },
  "& [data-code-line]": {
    display: "grid",
    gridTemplateColumns: "4.75ch minmax(0, 1fr)",
  },
  "& [data-code-line-number]": {
    borderRight: "1px solid",
    borderColor: "divider",
    color: "text.disabled",
    mr: 1.25,
    pr: 1,
    textAlign: "right",
    userSelect: "none",
  },
  "& [data-code-line-content]": {
    minWidth: 0,
    pl: 0,
  },
  "& [data-code-token='comment']": {
    color: "#8a8a8a",
  },
  "& [data-code-token='constant']": {
    color: "#9a5b13",
  },
  "& [data-code-token='keyword']": {
    color: "#9b3f78",
    fontWeight: 700,
  },
  "& [data-code-token='number']": {
    color: "#a15c24",
  },
  "& [data-code-token='property']": {
    color: "#2f6f86",
  },
  "& [data-code-token='string']": {
    color: "#4f7a28",
  },
  "& [data-code-token='symbol']": {
    color: "#9a5b13",
  },
  "& [data-code-token='tag']": {
    color: "#9b3f78",
  },
  "& code": {
    backgroundColor: "#f7f7f7",
    borderRadius: 1,
    color: "text.primary",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.9em",
    px: 0.5,
    py: 0.125,
  },
  "& pre code": {
    backgroundColor: "transparent",
    borderRadius: 0,
    color: "inherit",
    fontSize: "inherit",
    p: 0,
  },
}
