import SendIcon from "@mui/icons-material/Send"
import SmartToyIcon from "@mui/icons-material/SmartToy"
import Avatar from "@mui/material/Avatar"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Paper from "@mui/material/Paper"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useEffect, useRef, useState } from "react"
import AppsDrawerLauncher from "../shared/AppsDrawerLauncher"
import { postJson } from "@/shared/lib/fetchJson"
import masudaImage from "../zukan/assets/masuda.webp"
import { MASUDA_AI_API_URL } from "./config"

const INITIAL_MESSAGES = [{ id: 1, role: "assistant", text: "こんにちはー！笑 どうしたん、今日は😳", draftReply: null }]
const FALLBACK_REPLY = "ええ、ちょい気になるやつ笑 もう少し聞かせてー！"
const STYLE_STRENGTH_OPTIONS = [
  { value: "weak", label: "弱め" },
  { value: "normal", label: "普通" },
  { value: "strong", label: "強め" },
]

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
            {isAssistant && message.draftReply && message.draftReply !== message.text ? (
              <Box
                sx={{
                  mt: 1,
                  pt: 1,
                  borderTop: "1px dashed",
                  borderColor: "divider",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  draft_reply
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {message.draftReply}
                </Typography>
              </Box>
            ) : null}
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
  const [styleStrength, setStyleStrength] = useState("normal")
  const [isReplying, setIsReplying] = useState(false)
  const abortControllerRef = useRef(null)
  const messagesEndRef = useRef(null)

  const resetConversation = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setMessages(INITIAL_MESSAGES)
    setDraft("")
    setStyleStrength("normal")
    setIsReplying(false)
  }

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" })
  }, [messages, isReplying])

  const buildHistory = (conversation) =>
    conversation
      .filter((message) => message.role === "user" || message.role === "assistant")
      .map(({ role, text }) => ({ role, content: text }))

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmed = draft.trim()
    if (!trimmed || isReplying) return

    const nextMessages = [...messages, { id: messages.length + 1, role: "user", text: trimmed }]
    setMessages(nextMessages)
    setIsReplying(true)
    setDraft("")

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const response = await postJson(
        MASUDA_AI_API_URL,
        {
          message: trimmed,
          history: buildHistory(nextMessages.slice(0, -1)),
          style_strength: styleStrength,
        },
        {
          signal: controller.signal,
        },
      )

      const reply = typeof response?.reply === "string" && response.reply.trim().length > 0 ? response.reply.trim() : FALLBACK_REPLY
      const draftReply =
        typeof response?.draft_reply === "string" && response.draft_reply.trim().length > 0 ? response.draft_reply.trim() : null
      setMessages((current) => [...current, { id: current.length + 1, role: "assistant", text: reply, draftReply }])
    } catch (error) {
      if (error?.name !== "AbortError") {
        setMessages((current) => [...current, { id: current.length + 1, role: "assistant", text: FALLBACK_REPLY, draftReply: null }])
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null
      }
      setIsReplying(false)
    }
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
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <FormControl size="small" sx={{ minWidth: 128 }}>
            <InputLabel id="masuda-style-strength-label">増田み</InputLabel>
            <Select
              labelId="masuda-style-strength-label"
              value={styleStrength}
              label="増田み"
              onChange={(event) => setStyleStrength(event.target.value)}
            >
              {STYLE_STRENGTH_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
          <Stack spacing={1.25}>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </Stack>
          <Box ref={messagesEndRef} />
        </Box>
        {isReplying ? <TypingIndicator /> : null}
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
            disabled={!draft.trim() || isReplying}
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
