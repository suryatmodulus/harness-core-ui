import type { AnserJsonEntry } from 'anser'

export interface LineData {
  raw: string
  anserJson?: AnserJsonEntry[]
  anserJsonLevel?: AnserJsonEntry[]
  anserJsonTime?: AnserJsonEntry[]
  anserJsonOut?: AnserJsonEntry[]
  isOpen?: boolean
  lineNumber?: number
}

export interface FormattedLogLine {
  level: string
  time: string
  out: string
}
