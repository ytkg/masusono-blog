export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`APIリクエスト失敗: ${res.status} ${res.statusText}`)
  }

  return (await res.json()) as T
}
