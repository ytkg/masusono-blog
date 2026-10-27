import { useEffect, useRef, useState } from "react"

async function getJson(url, signal) {
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(60000)]) })
  if (!response.ok) {
    const error = new Error("読み込めませんでした")
    error.status = response.status
    throw error
  }
  return response.json()
}

export default function useBookshelf() {
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

  const retry = () => load(session.current)

  const discardCover = () => {
    covers.current.set(selected.isbn, Promise.resolve(null))
    setCover(null)
  }

  return { state, selected, cover, open, close, select, dismiss, retry, discardCover }
}
