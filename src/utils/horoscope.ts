import data from '../assets/horoscope.json'

export type HoroscopeEntry = {
  sign: string
  content: string
  item: string
  color: string
  rank: number
  total: number
  love: number
  money: number
  job: number
  day?: number | string
}

type HoroscopeData = {
  horoscope: Record<string, HoroscopeEntry[]>
}

const HOROSCOPE: HoroscopeData = data as unknown as HoroscopeData

export function formatDateKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}/${m}/${d}`
}

export function getHoroscopeForDate(date = new Date()): { key: string; entries: HoroscopeEntry[] } {
  const key = formatDateKey(date)
  const list = HOROSCOPE.horoscope?.[key] || []
  const entries = [...list].sort((a, b) => a.rank - b.rank)
  return { key, entries }
}

export function getTodayHoroscope(): { key: string; entries: HoroscopeEntry[] } {
  return getHoroscopeForDate(new Date())
}
