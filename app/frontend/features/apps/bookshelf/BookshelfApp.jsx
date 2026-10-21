import { useEffect, useRef, useState } from "react"
import MenuBookIcon from "@mui/icons-material/MenuBook"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Typography from "@mui/material/Typography"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"

const colors = ["#743d36", "#315c52", "#354d70", "#634d72", "#695322"]

async function getJson(url, signal) {
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]) })
  if (!response.ok) {
    const error = new Error("読み込めませんでした")
    error.status = response.status
    throw error
  }
  return response.json()
}

export default function BookshelfApp() {
  const [state, setState] = useState({ books: [], loading: false, error: false })
  const [selected, setSelected] = useState(null)
  const [cover, setCover] = useState(null)
  const covers = useRef(new Map())
  const coverRateLimited = useRef(false)
  const coverQueue = useRef(Promise.resolve())
  const session = useRef(null)
  const selectedIsbn = useRef(null)

  useEffect(() => () => session.current?.abort(), [])

  const load = async (controller) => {
    setState({ books: [], loading: true, error: false })
    try {
      const data = await getJson("/api/app/bookshelf", controller.signal)
      if (!controller.signal.aborted)
        setState({
          ...data,
          books: data.books.map((book) => ({
            ...book,
            author: book.author
              .replace(/[,，]\s*\d{4}\s*[-–－](?:\s*\d{4})?(?=$|[\s/／・,，])/g, "")
              .replace(/([\p{L}\p{M}])\s*[,，/／]\s*(?=[\p{L}\p{M}])/gu, "$1 ")
              .trim(),
          })),
          loading: false,
          error: false,
        })
    } catch {
      if (!controller.signal.aborted) setState({ books: [], loading: false, error: true })
    }
  }

  const open = () => {
    session.current?.abort()
    session.current = new AbortController()
    covers.current = new Map()
    coverRateLimited.current = false
    coverQueue.current = Promise.resolve()
    setSelected(null)
    selectedIsbn.current = null
    setCover(null)
    return load(session.current)
  }

  const close = () => {
    session.current?.abort()
    covers.current.clear()
    selectedIsbn.current = null
    setSelected(null)
    setCover(null)
    setState({ books: [], loading: false, error: false })
  }

  const select = async (book) => {
    setSelected(book)
    selectedIsbn.current = book.isbn
    setCover(null)
    const controller = session.current
    if (coverRateLimited.current && !covers.current.has(book.isbn)) return
    if (!covers.current.has(book.isbn)) {
      covers.current.set(
        book.isbn,
        coverQueue.current
          .then(() => {
            if (controller.signal.aborted || coverRateLimited.current) return { cover: null }
            return getJson(`/api/app/bookshelf/${book.isbn}/cover`, controller.signal)
          })
          .then((data) => data.cover)
          .catch((error) => {
            if (!controller.signal.aborted && [429, 503].includes(error.status)) coverRateLimited.current = true
            return null
          }),
      )
      coverQueue.current = covers.current.get(book.isbn)
    }
    const result = await covers.current.get(book.isbn)
    if (!controller.signal.aborted && selectedIsbn.current === book.isbn) setCover(result)
  }

  const dismiss = () => {
    selectedIsbn.current = null
    setSelected(null)
  }

  return (
    <AppsDialogLauncher
      edgeToEdge
      contentSx={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}
      title="増田とその他！の本棚"
      launcherLabel="本棚"
      buttonAriaLabel="本棚を開く"
      buttonIcon={<MenuBookIcon />}
      onOpen={open}
      onClose={close}
    >
      <Box
        component="section"
        aria-label="本棚の画面"
        sx={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          pt: 2,
          pl: "max(8px, env(safe-area-inset-left))",
          pr: "max(8px, env(safe-area-inset-right))",
          pb: "max(24px, env(safe-area-inset-bottom))",
          bgcolor: "#f6f0e6",
        }}
      >
        {state.loading && <Typography role="status">読み込み中…</Typography>}
        {state.error && (
          <Alert severity="error" action={<Button onClick={() => load(session.current)}>再試行</Button>}>
            読み込めませんでした
          </Alert>
        )}
        {!state.loading && !state.error && state.books.length === 0 && (
          <Typography>表示できる本はまだありません</Typography>
        )}
        {state.partial && (
          <Alert severity="warning">一部の本を読み込めませんでした。取得できた本を表示しています。</Alert>
        )}
        <Box
          aria-label="記事に登場する本"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 44px)",
            gap: "24px 6px",
            justifyContent: "space-evenly",
            p: state.books.length === 0 ? "8px 4px 20px" : "8px 4px 0",
            minHeight: state.books.length === 0 ? 300 : 0,
            border: "12px solid #8a6140",
            borderTopWidth: 16,
            borderBottomWidth: 18,
            borderRadius: "4px",
            boxShadow: "0 4px 8px #493b2b33, inset 0 3px 8px #493b2b30",
            bgcolor: "#eddfc8",
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0 252px, #6b482e 252px 255px, #b68c5c 255px 264px, #8a6140 264px 268px, transparent 268px 276px)",
            backgroundOrigin: "content-box",
            backgroundClip: "padding-box",
          }}
        >
          {state.books.map((book) => (
            <Button
              key={book.isbn}
              onClick={() => select(book)}
              aria-label={`${book.title} / ${book.author}`}
              sx={{
                width: 44,
                minWidth: 44,
                height: 252,
                p: "12px 6px",
                borderRadius: "3px 6px 3px 3px",
                color: "#fff",
                bgcolor: colors[Number(book.isbn) % colors.length],
                borderBottom: "8px solid #b39b78",
                boxShadow: "inset 4px 0 0 #ffffff24, 2px 4px 0 #493b2b33",
                textTransform: "none",
                display: "flex",
                alignItems: "flex-start",
                "&:hover": { bgcolor: colors[Number(book.isbn) % colors.length], filter: "brightness(1.15)" },
                "&:focus-visible": { outline: "3px solid", outlineColor: "text.primary", outlineOffset: 3 },
              }}
            >
              <Box
                component="span"
                sx={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  height: "100%",
                  width: 32,
                  flexShrink: 0,
                  fontFamily: "'Hiragino Sans', 'Yu Gothic', 'Noto Sans CJK JP', sans-serif",
                  fontSize: 16,
                  lineHeight: "32px",
                }}
              >
                {book.title}
              </Box>
            </Button>
          ))}
        </Box>
        <Typography variant="caption" component="p" sx={{ mt: 2, textAlign: "center" }}>
          書誌情報：
          <a href="https://openbd.jp/" target="_blank" rel="noreferrer">
            openBD
          </a>
        </Typography>
      </Box>
      <Dialog open={Boolean(selected)} onClose={dismiss} aria-labelledby="bookshelf-book-title" fullWidth maxWidth="sm">
        {selected && (
          <>
            <DialogTitle id="bookshelf-book-title" sx={{ overflowWrap: "anywhere" }}>
              {selected.title}
            </DialogTitle>
            <DialogContent sx={{ overflowWrap: "anywhere" }}>
              <Typography sx={{ mb: 2 }}>{selected.author}</Typography>
              {cover && (
                <Box sx={{ mb: 2 }}>
                  <a
                    href={cover.googleBooksUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Google Booksでこの本を見る"
                  >
                    <Box
                      component="img"
                      src={cover.imageUrl}
                      alt={`${selected.title}の表紙`}
                      onError={() => {
                        covers.current.set(selected.isbn, Promise.resolve(null))
                        setCover(null)
                      }}
                      sx={{ maxWidth: "100%", width: "auto", height: "auto", maxHeight: 220 }}
                    />
                  </a>
                  <Box
                    component="img"
                    src="https://books.google.com/googlebooks/images/poweredby.png"
                    alt="Powered by Google"
                    sx={{ display: "block", my: 1 }}
                  />
                  <Typography variant="caption" component="p">
                    <a href={cover.googleBooksUrl} target="_blank" rel="noreferrer">
                      Google Books
                    </a>{" "}
                    提供
                  </Typography>
                  <Typography variant="caption" component="p">
                    <a href={cover.removalContactUrl} target="_blank" rel="noreferrer">
                      表紙の削除依頼・お問い合わせ
                    </a>
                  </Typography>
                </Box>
              )}
              <Typography component="h3" variant="subtitle1">
                登場記事
              </Typography>
              <Box component="ul" sx={{ pl: 3 }}>
                {selected.articles.map((article) => (
                  <Box component="li" key={article.id} sx={{ mb: 1 }}>
                    <a href={`/articles/${encodeURIComponent(article.id)}`}>{article.title}</a>
                  </Box>
                ))}
              </Box>
              <a href={selected.amazonUrl} target="_blank" rel="noreferrer">
                Amazonでこの版を見る
              </a>
            </DialogContent>
            <DialogActions>
              <Button onClick={dismiss}>棚に戻る</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </AppsDialogLauncher>
  )
}
