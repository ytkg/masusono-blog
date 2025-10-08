export interface Author {
  id?: string
  name?: string
  [key: string]: unknown
}

export interface Article {
  id: string
  title: string
  publishedAt?: string
  updatedAt?: string
  createdAt?: string
  content?: string
  body?: string
  author?: Author
  [key: string]: unknown
}

interface ListResponse<T> {
  contents: T[]
  totalCount: number
  offset: number
  limit: number
}

const SERVICE_DOMAIN = 'masusono'
const API_BASE = `https://${SERVICE_DOMAIN}.microcms.io/api/v1`

const API_KEY: string = 'H5FVIb97NuVgDcqZjUam1ixou64qInmQCh7T'

// SWR 用の共通フェッチャー
export async function apiFetchJson<T = unknown>(url: string): Promise<T> {
  const full = url.startsWith('http') ? url : `${API_BASE}/${url.replace(/^\//, '')}`
  const res = await fetch(full, {
    headers: {
      'X-API-KEY': API_KEY,
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`microCMS リクエスト失敗: ${res.status} ${res.statusText} ${text}`)
  }
  return (await res.json()) as T
}

export async function fetchArticles(limit = 20): Promise<ListResponse<Article>> {
  if (!API_KEY) {
    throw new Error('VITE_MICROCMS_API_KEY が設定されていません。')
  }

  const res = await fetch(`${API_BASE}/articles?limit=${limit}`, {
    headers: {
      'X-API-KEY': API_KEY,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`microCMS リクエスト失敗: ${res.status} ${res.statusText} ${text}`)
  }

  return (await res.json()) as ListResponse<Article>
}

export async function fetchArticle(id: string): Promise<Article> {
  if (!API_KEY) {
    throw new Error('VITE_MICROCMS_API_KEY が設定されていません。')
  }

  const res = await fetch(`${API_BASE}/articles/${id}`, {
    headers: {
      'X-API-KEY': API_KEY,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`microCMS リクエスト失敗: ${res.status} ${res.statusText} ${text}`)
  }

  return (await res.json()) as Article
}

export async function fetchAuthors(limit = 50): Promise<ListResponse<Author>> {
  if (!API_KEY) {
    throw new Error('VITE_MICROCMS_API_KEY が設定されていません。')
  }

  const res = await fetch(`${API_BASE}/authors?limit=${limit}`, {
    headers: {
      'X-API-KEY': API_KEY,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`microCMS リクエスト失敗: ${res.status} ${res.statusText} ${text}`)
  }

  return (await res.json()) as ListResponse<Author>
}
