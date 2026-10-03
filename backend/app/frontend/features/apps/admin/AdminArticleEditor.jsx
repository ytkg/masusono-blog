import { useEffect, useRef, useState } from "react"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import StatusAlert from "../../../shared/components/StatusAlert"
import LoadingStatus from "../../../shared/components/LoadingStatus"
import { requestJson } from "../../../shared/lib/fetchJson"
import AdminSectionHeader from "./AdminSectionHeader"
import ArticleBodyEditor from "./ArticleBodyEditor"
import ArticleStructuredHtml from "../../blog/ArticleStructuredHtml"
import { changedFields, editorFields } from "./articleEditorData"

export default function AdminArticleEditor({ id, csrfToken, onBack, onDirtyChange, onSaved }) {
  const feedbackRef = useRef(null)
  const [data, setData] = useState(null)
  const [fields, setFields] = useState(null)
  const [initial, setInitial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [blocked, setBlocked] = useState(false)
  const [confirmSave, setConfirmSave] = useState(false)
  const [tab, setTab] = useState("edit")
  const [loadKey, setLoadKey] = useState(0)
  const url = `/api/app/management/articles/${encodeURIComponent(id)}`
  const dirty = Boolean(fields && initial && Object.keys(fields).some((key) => fields[key] !== initial[key]))

  useEffect(() => {
    onDirtyChange(dirty || pending)
    return () => onDirtyChange(false)
  }, [dirty, pending, onDirtyChange])

  useEffect(() => {
    if (!dirty) return
    function beforeUnload(event) {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", beforeUnload)
    return () => window.removeEventListener("beforeunload", beforeUnload)
  }, [dirty])

  useEffect(() => {
    let active = true
    requestJson(url)
      .then((result) => {
        if (!active) return
        setData(result)
        const next = editorFields(result.article)
        setFields(next)
        setInitial(next)
        setBlocked(false)
        setError("")
      })
      .catch((result) => {
        if (active) setError(result?.message || "記事を取得できませんでした。")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [url, loadKey])

  useEffect(() => {
    if (error || notice) feedbackRef.current?.scrollIntoView?.({ block: "nearest" })
  }, [error, notice])

  function reload() {
    if (dirty && !window.confirm("未保存の変更を破棄して再読み込みしますか？")) return
    setLoading(true)
    setNotice("")
    setLoadKey((key) => key + 1)
  }

  async function save() {
    setConfirmSave(false)
    let attributes
    try {
      attributes = changedFields(fields, initial)
    } catch {
      setError("公開日時を入力してください。")
      return
    }
    setPending(true)
    setError("")
    setNotice("")
    try {
      const result = await requestJson(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        body: JSON.stringify({ article: attributes, revision: data.article.revision }),
      })
      if (result.article.save_uncertain) {
        setBlocked(true)
        setNotice(
          "保存を送信しましたが、保存内容や更新後の状態を確認できません。microCMS の内容を確認して再読み込みしてください。",
        )
      } else {
        const next = editorFields(result.article)
        setData(result)
        setFields(next)
        setInitial(next)
        setNotice("保存しました。")
        onSaved()
      }
    } catch (result) {
      setError(result?.message || "保存結果を確認できません。再保存する前に microCMS の内容を確認してください。")
      if (
        !result?.status ||
        result.status >= 500 ||
        [401, 409].includes(result.status) ||
        result.code === "save_uncertain"
      )
        setBlocked(true)
    } finally {
      setPending(false)
    }
  }

  const article = data?.article
  const changeField = (key, value) => setFields((current) => ({ ...current, [key]: value }))
  return (
    <Stack spacing={2} sx={{ maxWidth: 960, mx: "auto" }}>
      <AdminSectionHeader title="記事の編集" onBack={onBack} backLabel="記事一覧へ戻る" />
      {loading ? <LoadingStatus>記事を読み込み中…</LoadingStatus> : null}
      {error ? <StatusAlert ref={feedbackRef}>{error}</StatusAlert> : null}
      {notice ? (
        <StatusAlert ref={feedbackRef} severity={blocked ? "warning" : "success"}>
          {notice}
        </StatusAlert>
      ) : null}
      {!loading && (!data || blocked) ? <Button onClick={reload}>再読み込み</Button> : null}
      {!loading && article ? (
        <>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="body2">
              {
                { PUBLISH: "公開中", DRAFT: "未公開", PUBLISH_AND_DRAFT: "公開中・下書きあり", CLOSED: "公開終了" }[
                  article.status
                ]
              }
            </Typography>
            <Button component="a" href="https://masusono.microcms.io/" target="_blank" rel="noopener noreferrer">
              microCMS を開く
            </Button>
          </Stack>
          {!article.editable ? (
            <StatusAlert severity="warning">この記事は編集対象外です。microCMS で確認してください。</StatusAlert>
          ) : (
            <>
              <Tabs value={tab} onChange={(_, value) => setTab(value)} aria-label="記事表示">
                <Tab value="edit" label="編集" />
                <Tab value="preview" label="プレビュー" />
              </Tabs>
              <Box hidden={tab !== "edit"}>
                <Stack spacing={2}>
                  <TextField
                    label="タイトル"
                    required
                    fullWidth
                    value={fields.title}
                    disabled={pending}
                    onChange={(event) => changeField("title", event.target.value)}
                  />
                  <TextField
                    select
                    label="著者"
                    value={fields.author}
                    disabled={pending}
                    onChange={(event) => changeField("author", event.target.value)}
                  >
                    <MenuItem value="">未設定</MenuItem>
                    {data.authors.map((author) => (
                      <MenuItem key={author.id} value={author.id}>
                        {author.name || author.id}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="公開日時（日本時間）"
                    type="datetime-local"
                    value={fields.publishedAt}
                    disabled={pending}
                    onChange={(event) => changeField("publishedAt", event.target.value)}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { step: 1 } }}
                  />
                  <Typography component="h4" variant="subtitle1">
                    本文
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Markdown 記法で見出し・太字・リストなどを入力できます。
                  </Typography>
                  <ArticleBodyEditor
                    key={article.revision}
                    content={article.content}
                    editable={article.content_editable}
                    disabled={pending}
                    onChange={(value) => changeField("content", value)}
                  />
                </Stack>
              </Box>
              <Box hidden={tab !== "preview"}>
                <Typography component="h3" variant="h5" sx={{ overflowWrap: "anywhere", mb: 2 }}>
                  {fields.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {data.authors.find((author) => author.id === fields.author)?.name}{" "}
                  {fields.publishedAt.replace("T", " ")} JST
                </Typography>
                <ArticleStructuredHtml html={fields.content} />
              </Box>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Button
                  variant="contained"
                  disabled={!dirty || pending || blocked || !fields.title.trim()}
                  onClick={() => setConfirmSave(true)}
                >
                  {pending ? "保存中…" : "保存"}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {dirty ? "未保存の変更があります" : "変更はありません"}
                </Typography>
              </Stack>
            </>
          )}
        </>
      ) : null}
      <Dialog open={confirmSave} onClose={() => setConfirmSave(false)} aria-labelledby="article-save-title">
        <DialogTitle id="article-save-title">記事を保存しますか？</DialogTitle>
        <DialogContent>
          <Typography sx={{ overflowWrap: "anywhere" }}>{fields?.title}</Typography>
          <Typography sx={{ mt: 2 }}>
            {article?.status === "PUBLISH"
              ? "公開中の記事への変更は即時反映されます。"
              : "未公開のまま内容を保存します。"}
            公開ステータスは変更しません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSave(false)}>キャンセル</Button>
          <Button variant="contained" onClick={save}>
            保存する
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
