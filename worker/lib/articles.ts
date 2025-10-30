interface MicrocmsAuthor {
  name?: string
  [key: string]: unknown
}

interface MicrocmsArticle {
  id: string
  publishedAt?: string
  title?: string
  content?: string
  author?: MicrocmsAuthor
  [key: string]: unknown
}

export interface ArticleSummary {
  id: string
  publishedAt?: string
  title?: string
  content?: string
  author: string | null
}

const MICROCMS_API_KEY = 'H5FVIb97NuVgDcqZjUam1ixou64qInmQCh7T'
const MICROCMS_ARTICLES_ENDPOINT = 'https://masusono.microcms.io/api/v1/articles'

export async function fetchArticles(): Promise<ArticleSummary[]> {
  const response = await fetch(`${MICROCMS_ARTICLES_ENDPOINT}?limit=100`, {
    headers: {
      'X-API-KEY': MICROCMS_API_KEY,
      Accept: 'application/json',
    },
  })

  const json = await response.json()
  const contents: MicrocmsArticle[] = Array.isArray(json?.contents)
    ? json.contents
    : []

  return contents.map((content) => ({
    id: content.id,
    publishedAt: content.publishedAt,
    title: content.title,
    content: content.content,
    author: content.author?.name ?? null,
  }))
}
