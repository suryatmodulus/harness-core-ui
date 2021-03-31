import type { AnserJsonEntry } from 'anser'

export interface LineData {
  raw: string
  anserJson?: AnserJsonEntry[]
  level?: AnserJsonEntry[]
  time?: AnserJsonEntry[]
  out?: AnserJsonEntry[]
  isOpen?: boolean
  lineNumber?: number
  sectionId?: string
}

export interface FormattedLogLine {
  level: string
  time: string
  out: string
}
