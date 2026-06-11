import { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import { articleBodyHtmlSx } from "./articleBodyHtmlSx"
import { annotateCodeBlockLanguages } from "./articleCodeBlocks"
import { runRubyCode } from "./runRubyCode"

const RUNNING_WARNING_DELAY_MS = 3000
const monoFont = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"

const runnerSx = (hasDetails) => ({
  display: "grid",
  gap: hasDetails ? 0.75 : 0,
  mb: hasDetails ? 1 : 0,
  mt: 0,
})

const codeBlockSx = (hasDetails) => [articleBodyHtmlSx, hasDetails ? { "& pre": { mb: 0 } } : null]

const runButtonSx = {
  color: "text.secondary",
  fontSize: "11px",
  fontWeight: 700,
  minWidth: 0,
  px: 0.5,
  py: 0,
  position: "absolute",
  right: 10,
  top: 9,
  "&:hover": { bgcolor: "transparent", color: "text.primary" },
}

const outputSx = {
  bgcolor: "#f7f7f7",
  borderRadius: 1,
  color: "text.primary",
  fontFamily: monoFont,
  fontSize: "0.8125rem",
  lineHeight: 1.7,
  m: 0,
  maxHeight: "8.5em",
  minHeight: "2rem",
  overflow: "auto",
  px: 1,
  py: 0.75,
  whiteSpace: "pre-wrap",
}

function buildOutputText(result) {
  const output = [result?.stdout, result?.stderr].filter(Boolean).join("")

  if (result?.error) return result.error

  return output || "(出力なし)"
}

export default function RubyExecutableCodeBlock({ code, html }) {
  const [result, setResult] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [showsRunningWarning, setShowsRunningWarning] = useState(false)
  const runIdRef = useRef(0)

  useEffect(() => {
    if (!isRunning) {
      setShowsRunningWarning(false)
      return undefined
    }

    const timer = window.setTimeout(() => {
      setShowsRunningWarning(true)
    }, RUNNING_WARNING_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [isRunning])

  async function handleRun() {
    const runId = runIdRef.current + 1
    runIdRef.current = runId
    setResult(null)
    setIsRunning(true)

    const nextResult = await runRubyCode(code)

    if (runIdRef.current !== runId) return

    setResult(nextResult)
    setIsRunning(false)
  }

  const outputText = buildOutputText(result)
  const hasDetails = Boolean(result || showsRunningWarning)

  return (
    <Box data-testid="ruby-code-runner" sx={runnerSx(hasDetails)}>
      <Box sx={{ position: "relative" }}>
        <Box
          data-testid="ruby-code-runner-code"
          sx={codeBlockSx(hasDetails)}
          dangerouslySetInnerHTML={{ __html: annotateCodeBlockLanguages(html) }}
        />
        <Button disabled={isRunning} onClick={handleRun} size="small" variant="text" sx={runButtonSx}>
          {isRunning ? "実行中" : "▶ 実行"}
        </Button>
      </Box>
      {showsRunningWarning ? (
        <Typography color="text.secondary" sx={{ fontSize: "12px" }}>
          実行が長引いています。停止できない場合はページを再読み込みしてください。
        </Typography>
      ) : null}
      {result ? (
        <Box sx={{ display: "grid", gap: 0.75 }}>
          {result.error ? (
            <Typography color="text.primary" sx={{ fontSize: "12px", fontWeight: 700 }}>
              エラー
            </Typography>
          ) : null}
          <Box component="pre" data-testid="ruby-code-runner-output" sx={outputSx}>
            {outputText}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}
