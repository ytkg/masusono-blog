import SendIcon from "@mui/icons-material/Send"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useEffect, useRef, useState } from "react"
import AppsDrawerLauncher from "../shared/AppsDrawerLauncher"
import masudaImage from "../zukan/assets/masuda.webp"

const INITIAL_MESSAGES = [{ id: 1, role: "assistant", text: "こんにちは" }]
const REPLY_DELAY_MS = 1200

function ChatMessage({ message }) {
  const isAssistant = message.role === "assistant"

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        justifyContent: isAssistant ? "flex-start" : "flex-end",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isAssistant ? "row" : "row-reverse",
          alignItems: "flex-start",
          gap: 1,
          maxWidth: "100%",
        }}
      >
        {isAssistant ? (
          <Avatar
            src={masudaImage}
            alt="増田"
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
            }}
          >
            増
          </Avatar>
        ) : null}
        <Box
          sx={{
            width: "fit-content",
            maxWidth: "70vw",
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.5,
              textAlign: isAssistant ? "left" : "right",
            }}
          >
            {isAssistant ? "増田AI美" : "あなた"}
          </Typography>
          <Paper
            elevation={0}
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 2.5,
              bgcolor: isAssistant ? "grey.50" : "success.50",
              border: "1px solid",
              borderColor: isAssistant ? "grey.300" : "success.200",
            }}
          >
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
              {message.text}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

function TypingIndicator() {
  return (
    <Box data-testid="masuda-aimi-typing" sx={{ px: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        増田AI美が入力中...
      </Typography>
    </Box>
  )
}

export default function MasudaAimiApp() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [draft, setDraft] = useState("")
  const [pendingReplies, setPendingReplies] = useState(0)
  const timeoutsRef = useRef(new Set())
  const messagesEndRef = useRef(null)

  const resetConversation = () => {
    for (const timeoutId of timeoutsRef.current) {
      clearTimeout(timeoutId)
    }
    timeoutsRef.current.clear()
    setMessages(INITIAL_MESSAGES)
    setDraft("")
    setPendingReplies(0)
  }

  useEffect(() => {
    const timeouts = timeoutsRef.current

    return () => {
      for (const timeoutId of timeouts) {
        clearTimeout(timeoutId)
      }
      timeouts.clear()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" })
  }, [messages, pendingReplies])

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmed = draft.trim()
    if (!trimmed) return

    setMessages((current) => [...current, { id: current.length + 1, role: "user", text: trimmed }])
    setPendingReplies((current) => current + 1)
    setDraft("")

    const timeoutId = window.setTimeout(() => {
      timeoutsRef.current.delete(timeoutId)
      setMessages((current) => [...current, { id: current.length + 1, role: "assistant", text: "こんにちは" }])
      setPendingReplies((current) => Math.max(0, current - 1))
    }, REPLY_DELAY_MS)

    timeoutsRef.current.add(timeoutId)
  }

  return (
    <AppsDrawerLauncher
      title="増田AI美"
      launcherLabel="増田AI美"
      buttonAriaLabel="増田AI美を開く"
      buttonIcon={<SmartToyIcon />}
      onClose={resetConversation}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
          <Stack spacing={1.25}>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </Stack>
          <Box ref={messagesEndRef} />
        </Box>
        {pendingReplies > 0 ? <TypingIndicator /> : null}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            position: "sticky",
            bottom: 0,
            display: "flex",
            gap: 1,
            alignItems: "flex-end",
            pt: 1,
          }}
        >
          <TextField
            label="メッセージ入力"
            placeholder="メッセージを入力"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            fullWidth
            multiline
            minRows={1}
            maxRows={4}
            autoComplete="off"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#ffffff",
                borderRadius: 3,
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            aria-label="送信"
            disabled={!draft.trim()}
            sx={{
              minWidth: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: "#111827",
              "&:hover": {
                bgcolor: "#111827",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>
    </AppsDrawerLauncher>
  )
}
