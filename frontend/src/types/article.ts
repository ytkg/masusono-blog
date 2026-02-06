export interface Article {
  id: string
  title: string
  publishedAt?: string
  updatedAt?: string
  createdAt?: string
  content?: string
  body?: string
  author?: ArticleAuthor | null
}

export interface ArticleAuthor {
  name: string
}
