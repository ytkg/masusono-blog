import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter"
import createElement from "react-syntax-highlighter/dist/esm/create-element"
import oneLight from "react-syntax-highlighter/dist/esm/styles/prism/one-light"
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash"
import css from "react-syntax-highlighter/dist/esm/languages/prism/css"
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript"
import json from "react-syntax-highlighter/dist/esm/languages/prism/json"
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup"
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby"
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql"
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript"

const monoFont = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"

SyntaxHighlighter.registerLanguage("bash", bash)
SyntaxHighlighter.registerLanguage("css", css)
SyntaxHighlighter.registerLanguage("javascript", javascript)
SyntaxHighlighter.registerLanguage("json", json)
SyntaxHighlighter.registerLanguage("markup", markup)
SyntaxHighlighter.registerLanguage("ruby", ruby)
SyntaxHighlighter.registerLanguage("sql", sql)
SyntaxHighlighter.registerLanguage("typescript", typescript)

const lineNumberSx = {
  background: "#f7f7f7",
  borderRight: "1px solid rgba(0, 0, 0, 0.12)",
  color: "rgba(0, 0, 0, 0.38)",
  display: "inline-block",
  left: 0,
  minWidth: "3ch",
  paddingLeft: "0.5rem",
  paddingRight: "0.5rem",
  position: "sticky",
  textAlign: "right",
  userSelect: "none",
  zIndex: 1,
}

const codeRowStyle = { display: "flex", lineHeight: 1.7, minWidth: "max-content", whiteSpace: "pre" }
const codeTextStyle = { display: "block", paddingLeft: "0.5rem" }

function paddedLineNumber(index) {
  return String(index + 1).padStart(3, "0")
}

export default function HighlightedCode({ block }) {
  return (
    <SyntaxHighlighter
      PreTag="pre"
      CodeTag="code"
      language={block.prismLanguage}
      showLineNumbers={false}
      style={oneLight}
      wrapLines
      lineProps={() => ({
        "data-code-line": true,
        style: {
          display: "block",
          lineHeight: 1.7,
          minWidth: "max-content",
          whiteSpace: "pre",
        },
      })}
      renderer={({ rows, stylesheet, useInlineStyles }) =>
        rows.map((row, index) => (
          <span key={index} data-code-line style={codeRowStyle}>
            <span className="react-syntax-highlighter-line-number" style={lineNumberSx}>
              {paddedLineNumber(index)}
            </span>
            <span style={codeTextStyle}>
              {createElement({
                key: `code-row-${index}`,
                node: row,
                stylesheet,
                useInlineStyles,
              })}
            </span>
          </span>
        ))
      }
      customStyle={{
        ...oneLight['pre[class*="language-"]'],
        background: "#f7f7f7",
        display: "block",
        margin: 0,
        minWidth: "max-content",
        overflow: "visible",
        padding: "0 1.5rem 0 0",
        whiteSpace: "pre",
      }}
      codeTagProps={{
        "data-code-language": block.languageLabel,
        style: {
          display: "block",
          fontFamily: monoFont,
          minWidth: "max-content",
          whiteSpace: "pre",
        },
      }}
    >
      {block.code}
    </SyntaxHighlighter>
  )
}
