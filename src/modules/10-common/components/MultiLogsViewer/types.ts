import type { AnserJsonEntry } from 'anser'

export interface LineData {
  raw: string
  anserJson: AnserJsonEntry[]
  isOpen?: boolean
  lineNumber?: number
}
