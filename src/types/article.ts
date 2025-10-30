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
