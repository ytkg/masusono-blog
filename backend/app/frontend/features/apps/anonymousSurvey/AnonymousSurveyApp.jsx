import { useEffect, useMemo, useRef, useState } from "react"
import HowToVoteIcon from "@mui/icons-material/HowToVote"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import PeopleIcon from "@mui/icons-material/People"
import PollIcon from "@mui/icons-material/Poll"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import SendIcon from "@mui/icons-material/Send"
import VisibilityIcon from "@mui/icons-material/Visibility"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import LinearProgress from "@mui/material/LinearProgress"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import AppsDrawerLauncher from "../shared/AppsDrawerLauncher"
import { ensureUserIdCookie } from "@/shared/lib/userId"
import { ANONYMOUS_SURVEY_IDENTIFIER, buildCableUrl } from "./anonymousSurveyCable"

const MAX_QUESTION_LENGTH = 120
const SUBSCRIPTION_TIMEOUT_MS = 5000
const DEFAULT_NAME = "NO NAME"
const cardSx = {
  borderRadius: 2,
  borderColor: "divider",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.06)",
}
const sectionHeaderSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1,
  flexWrap: "wrap",
}
const mutedPanelSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  bgcolor: "grey.50",
  p: 1.5,
}
const compactButtonSx = {
  minHeight: 40,
  px: 2,
  fontWeight: 700,
  borderRadius: 2,
}
const actionButtonSx = {
  ...compactButtonSx,
  minHeight: 44,
  alignSelf: "flex-start",
}
const choiceButtonSx = {
  minHeight: 52,
  fontWeight: 700,
  borderRadius: 2,
}

async function fetchCurrentUserName(userId) {
  try {
    const response = await fetch(`/api/app/users/${encodeURIComponent(userId)}.json`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    if (!response.ok) return DEFAULT_NAME

    const current = await response.json()
    return current?.name?.toString()?.trim() || DEFAULT_NAME
  } catch (_error) {
    return DEFAULT_NAME
  }
}

function statusLabel(status) {
  switch (status) {
    case "open":
      return "接続中"
    case "connecting":
      return "接続準備中"
    case "error":
      return "エラー"
    default:
      return "未接続"
  }
}

function normalizeParticipants(participants) {
  if (!Array.isArray(participants)) return []

  return participants.map((participant) => ({
    userId: participant?.userId?.toString() || participant?.name?.toString() || `${Date.now()}-${Math.random()}`,
    name: participant?.name?.toString() || "NO NAME",
  }))
}

function normalizeSurvey(survey) {
  if (!survey) return null

  const phase = ["asking", "revealed"].includes(survey.phase) ? survey.phase : "voting"

  return {
    id: survey.id?.toString() || "",
    question: survey.question?.toString() || "",
    phase,
    round: Number(survey.round) || 1,
    questioner: {
      userId: survey.questioner?.userId?.toString() || "",
      name: survey.questioner?.name?.toString() || "NO NAME",
    },
    nextQuestioner: survey.nextQuestioner
      ? {
          userId: survey.nextQuestioner?.userId?.toString() || "",
          name: survey.nextQuestioner?.name?.toString() || "NO NAME",
        }
      : null,
    votedCount: Number(survey.votedCount) || 0,
    participantCount: Number(survey.participantCount) || 0,
    yesCount: Number(survey.yesCount) || 0,
    noCount: Number(survey.noCount) || 0,
  }
}

function sendCableAction(socket, action, payload = {}) {
  if (!socket || socket.readyState !== window.WebSocket.OPEN) return false

  socket.send(
    JSON.stringify({
      command: "message",
      identifier: ANONYMOUS_SURVEY_IDENTIFIER,
      data: JSON.stringify({
        action,
        ...payload,
      }),
    }),
  )
  return true
}

function participantLabel(participant, index, currentUserId) {
  const labels = []
  if (participant.userId === currentUserId) labels.push("あなた")
  if (index === 0) labels.push("代表")

  return labels.length > 0 ? `${participant.name}（${labels.join("・")}）` : participant.name
}

function RoomStatus({ participants, status, currentUserId }) {
  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.25, p: 1.75, "&:last-child": { pb: 1.75 } }}>
        <Box sx={sectionHeaderSx}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <HowToVoteIcon sx={{ fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              ルーム状況
            </Typography>
          </Box>
          <Chip label={statusLabel(status)} color={status === "open" ? "success" : "default"} variant="outlined" size="small" />
        </Box>
        <Divider />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
          <PeopleIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            参加者 {participants.length}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, minHeight: 28 }}>
          {participants.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              参加者はまだいません
            </Typography>
          ) : (
            participants.map((participant, index) => (
              <Chip
                key={participant.userId}
                size="small"
                label={participantLabel(participant, index, currentUserId)}
                color="default"
                variant="outlined"
                sx={{
                  maxWidth: "100%",
                  minHeight: 30,
                  borderRadius: 1.5,
                  "& .MuiChip-label": { overflowWrap: "anywhere", whiteSpace: "normal" },
                }}
              />
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

function SurveyResult({ survey }) {
  const totalVotes = survey.yesCount + survey.noCount
  const yesRate = totalVotes > 0 ? Math.round((survey.yesCount / totalVotes) * 100) : 0
  const noRate = totalVotes > 0 ? 100 - yesRate : 0

  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            YES {survey.yesCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {yesRate}%
          </Typography>
        </Box>
        <LinearProgress variant="determinate" value={yesRate} sx={{ height: 12, borderRadius: 1 }} />
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            NO {survey.noCount}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {noRate}%
          </Typography>
        </Box>
        <LinearProgress color="inherit" variant="determinate" value={noRate} sx={{ height: 12, borderRadius: 1 }} />
      </Box>
    </Stack>
  )
}

function SurveyStage({ survey, isRevealed }) {
  const stageLabel = isRevealed ? "結果" : survey.phase === "asking" ? "出題" : "回答受付中"

  return (
    <Box sx={sectionHeaderSx}>
      <Chip size="small" label={`第${survey.round}問`} color="primary" />
      <Chip size="small" label={stageLabel} variant="outlined" />
    </Box>
  )
}

function ActiveSurvey({
  survey,
  currentUserId,
  question,
  selectedAnswer,
  onQuestionChange,
  onSubmitQuestion,
  onVote,
  onReveal,
  onNextQuestion,
}) {
  const isAsking = survey.phase === "asking"
  const isRevealed = survey.phase === "revealed"
  const isQuestioner = survey.questioner.userId === currentUserId
  const isNextQuestioner = survey.nextQuestioner?.userId === currentUserId
  const canReveal = survey.participantCount > 0 && survey.votedCount >= survey.participantCount

  if (isAsking) {
    return (
      <Card variant="outlined" sx={cardSx}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2, "&:last-child": { pb: 2 } }}>
          <SurveyStage survey={survey} isRevealed={false} />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography variant="h6" component="h3" sx={{ overflowWrap: "anywhere", lineHeight: 1.45, fontWeight: 700 }}>
              {survey.questioner.name}さんの質問
            </Typography>
            <Typography variant="body2" color="text.secondary">
              YES / NO で答えられる質問を作成します
            </Typography>
          </Box>

          {isQuestioner ? (
            <Box
              component="form"
              onSubmit={onSubmitQuestion}
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto" }, gap: 1, alignItems: "flex-end" }}
            >
              <TextField
                label="YES / NO で答えられる質問"
                value={question}
                onChange={(event) => onQuestionChange(event.target.value.slice(0, MAX_QUESTION_LENGTH))}
                inputProps={{ maxLength: MAX_QUESTION_LENGTH }}
                size="small"
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                disabled={question.trim().length === 0}
                sx={{ ...compactButtonSx, width: { xs: "100%", sm: "auto" }, minWidth: { sm: 96 } }}
              >
                出題
              </Button>
            </Box>
          ) : (
            <Box sx={mutedPanelSx}>
              <Typography variant="body2" color="text.secondary">
                出題を待っています
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="outlined" sx={cardSx}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2, "&:last-child": { pb: 2 } }}>
        <SurveyStage survey={survey} isRevealed={isRevealed} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Typography variant="h6" component="h3" sx={{ overflowWrap: "anywhere", lineHeight: 1.45, fontWeight: 700 }}>
            {survey.question}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            <Chip size="small" label={`出題者 ${survey.questioner.name}`} variant="outlined" />
            <Chip size="small" label={`回答 ${survey.votedCount} / ${survey.participantCount}`} variant="outlined" />
          </Box>
        </Box>

        {isRevealed ? (
          <SurveyResult survey={survey} />
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <Button
              variant={selectedAnswer === true ? "contained" : "outlined"}
              startIcon={selectedAnswer === true ? <CheckCircleIcon /> : null}
              onClick={() => onVote(true)}
              sx={choiceButtonSx}
            >
              YES
            </Button>
            <Button
              variant={selectedAnswer === false ? "contained" : "outlined"}
              color="inherit"
              startIcon={selectedAnswer === false ? <CheckCircleIcon /> : null}
              onClick={() => onVote(false)}
              sx={choiceButtonSx}
            >
              NO
            </Button>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-start" }}>
          {isRevealed ? (
            <>
              {isQuestioner || isNextQuestioner ? (
                <Button variant="contained" endIcon={<NavigateNextIcon />} onClick={onNextQuestion} sx={actionButtonSx}>
                  {isQuestioner ? "次の出題者へ" : "自分の出題へ進む"}
                </Button>
              ) : (
                <Box sx={mutedPanelSx}>
                  <Typography variant="body2" color="text.secondary">
                    {survey.nextQuestioner ? "次の出題者が進めます" : "出題者が次へ進めます"}
                  </Typography>
                </Box>
              )}
            </>
          ) : isQuestioner ? (
            <Button variant="outlined" startIcon={<VisibilityIcon />} disabled={!canReveal} onClick={onReveal} sx={actionButtonSx}>
              結果を見る
            </Button>
          ) : (
            <Box sx={mutedPanelSx}>
              <Typography variant="body2" color="text.secondary">
                出題者が結果を公開します
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

function AnonymousSurveyRoom() {
  const socketRef = useRef(null)
  const nameRef = useRef(null)
  const [currentUserId, setCurrentUserId] = useState("")
  const [status, setStatus] = useState("connecting")
  const [errorMessage, setErrorMessage] = useState("")
  const [participants, setParticipants] = useState([])
  const [survey, setSurvey] = useState(null)
  const [name, setName] = useState(DEFAULT_NAME)
  const [question, setQuestion] = useState("")
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const cableUrl = useMemo(() => buildCableUrl(), [])
  const isHost = participants[0]?.userId === currentUserId
  const canStart = status === "open" && !survey && isHost && participants.length >= 2

  useEffect(() => {
    nameRef.current = name.trim() || "NO NAME"
  }, [name])

  useEffect(() => {
    setSelectedAnswer(null)
    setQuestion("")
  }, [survey?.id])

  useEffect(() => {
    const userId = ensureUserIdCookie()
    let socket = null
    let subscriptionTimer = null
    let cancelled = false

    setCurrentUserId(userId)

    if (!window.WebSocket) {
      setStatus("error")
      setErrorMessage("このブラウザでは WebSocket が使えません")
      return undefined
    }

    const clearSubscriptionTimer = () => {
      if (!subscriptionTimer) return

      window.clearTimeout(subscriptionTimer)
      subscriptionTimer = null
    }

    const subscribe = () => {
      setStatus("connecting")
      socket.send(
        JSON.stringify({
          command: "subscribe",
          identifier: ANONYMOUS_SURVEY_IDENTIFIER,
        }),
      )
      clearSubscriptionTimer()
      subscriptionTimer = window.setTimeout(() => {
        setStatus("error")
        setErrorMessage("アンケートサーバーから応答がありません。backend を再起動してください")
      }, SUBSCRIPTION_TIMEOUT_MS)
    }

    const handleMessage = (event) => {
      const packet = JSON.parse(event.data)

      if (packet.type === "confirm_subscription") {
        clearSubscriptionTimer()
        setStatus("open")
        setErrorMessage("")
        sendCableAction(socket, "appear", { name: nameRef.current })
        return
      }

      if (packet.type === "reject_subscription") {
        clearSubscriptionTimer()
        setStatus("error")
        setErrorMessage("匿名アンケートに参加できませんでした")
        return
      }

      if (packet.type || !packet.message || typeof packet.message !== "object") return
      if (packet.message.type !== "state") return

      setParticipants(normalizeParticipants(packet.message.participants))
      setSurvey(normalizeSurvey(packet.message.survey))
    }

    const handleError = () => {
      clearSubscriptionTimer()
      setStatus("error")
      setErrorMessage("WebSocket 接続でエラーが発生しました")
    }

    const handleClose = () => {
      clearSubscriptionTimer()
      setStatus("closed")
    }

    const connect = async () => {
      const fetchedName = await fetchCurrentUserName(userId)
      if (cancelled) return

      setName(fetchedName)
      nameRef.current = fetchedName
      socket = new window.WebSocket(cableUrl)
      socketRef.current = socket
      socket.addEventListener("open", subscribe)
      socket.addEventListener("message", handleMessage)
      socket.addEventListener("error", handleError)
      socket.addEventListener("close", handleClose)
    }

    void connect()

    return () => {
      cancelled = true
      if (!socket) return

      socket.removeEventListener("open", subscribe)
      socket.removeEventListener("message", handleMessage)
      socket.removeEventListener("error", handleError)
      socket.removeEventListener("close", handleClose)
      clearSubscriptionTimer()
      socket.close()
      socketRef.current = null
    }
  }, [cableUrl])

  const startGame = () => {
    sendCableAction(socketRef.current, "start_game")
  }

  const submitQuestion = (event) => {
    event.preventDefault()

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) return

    sendCableAction(socketRef.current, "submit_question", { question: trimmedQuestion })
    setQuestion("")
  }

  const vote = (answer) => {
    setSelectedAnswer(answer)
    sendCableAction(socketRef.current, "vote", { answer })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: "100%" }}>
      <RoomStatus participants={participants} status={status} currentUserId={currentUserId} />

      {errorMessage ? (
        <Typography color="error" variant="body2">
          {errorMessage}
        </Typography>
      ) : null}

      {survey ? (
        <ActiveSurvey
          survey={survey}
          currentUserId={currentUserId}
          question={question}
          selectedAnswer={selectedAnswer}
          onQuestionChange={setQuestion}
          onSubmitQuestion={submitQuestion}
          onVote={vote}
          onReveal={() => sendCableAction(socketRef.current, "reveal")}
          onNextQuestion={() => sendCableAction(socketRef.current, "next_question")}
        />
      ) : (
        <Card variant="outlined" sx={cardSx}>
          <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2, "&:last-child": { pb: 2 } }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <PollIcon sx={{ fontSize: 22 }} />
                <Typography variant="h6" component="h3">
                  開始待ち
                </Typography>
              </Box>
              {isHost ? (
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<PlayArrowIcon />}
                  disabled={!canStart}
                  onClick={startGame}
                  sx={actionButtonSx}
                >
                  スタート
                </Button>
              ) : null}
            </Box>
            {!isHost ? (
              <Box sx={mutedPanelSx}>
                <Typography variant="body2" color="text.secondary">
                  最初の参加者が開始します
                </Typography>
              </Box>
            ) : null}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default function AnonymousSurveyApp() {
  return (
    <AppsDrawerLauncher
      title="匿名アンケート"
      launcherLabel="匿名"
      buttonAriaLabel="匿名アンケートを開く"
      buttonIcon={<HowToVoteIcon />}
    >
      <AnonymousSurveyRoom />
    </AppsDrawerLauncher>
  )
}
