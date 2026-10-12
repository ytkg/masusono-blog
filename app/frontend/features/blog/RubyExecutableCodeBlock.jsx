import { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import StatusAlert from "@/shared/components/StatusAlert"
import LoadingStatus from "@/shared/components/LoadingStatus"
import CodeBlock, { CodeBlockRunButton } from "./CodeBlock"
import { buildCodeBlockDataFromHtml } from "./codeBlockData"
import { runRubyCode } from "./runRubyCode"

const RUNNING_WARNING_DELAY_MS = 3000
const monoFont = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"

const runnerSx = (hasDetails) => ({
  display: "grid",
  gap: hasDetails ? 0.75 : 0,
  mb: hasDetails ? 1 : 0,
  mt: 0,
})

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
  const hasDetails = Boolean(result || isRunning)
  const block = buildCodeBlockDataFromHtml(html)

  return (
    <Box data-testid="ruby-code-runner" sx={runnerSx(hasDetails)}>
      {block ? (
        <CodeBlock
          block={block}
          action={<CodeBlockRunButton disabled={isRunning} isRunning={isRunning} onClick={handleRun} />}
        />
      ) : null}
      {isRunning ? <LoadingStatus>実行中...</LoadingStatus> : null}
      {showsRunningWarning ? (
        <StatusAlert severity="warning">
          実行が長引いています。停止できない場合はページを再読み込みしてください。
        </StatusAlert>
      ) : null}
      {result ? (
        <Box sx={{ display: "grid", gap: 0.75 }}>
          {result.error ? <StatusAlert>{result.error}</StatusAlert> : null}
          {!result.error ? (
            <Box component="pre" data-testid="ruby-code-runner-output" sx={outputSx}>
              {outputText}
            </Box>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}
