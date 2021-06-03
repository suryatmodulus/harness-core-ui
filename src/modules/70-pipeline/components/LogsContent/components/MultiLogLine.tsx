import React from 'react'
import { LogLine } from '@common/components/LogViewer/LogLine'

import { getRegexForSearch } from '../LogsState/utils'
import type { LogLineData } from '../LogsState/types'
import css from './MultiLogLine.module.scss'

export interface GetTextWithSearchMarkersProps {
  txt?: string
  searchText?: string
  searchIndices?: number[]
  currentSearchIndex: number
}

export function getTextWithSearchMarkers(props: GetTextWithSearchMarkersProps): string {
  const { searchText, txt, searchIndices, currentSearchIndex } = props
  if (!searchText) {
    return txt || ''
  }

  if (!txt) {
    return ''
  }

  const searchRegex = getRegexForSearch(searchText)

  let match: RegExpExecArray | null
  const chunks: Array<{ start: number; end: number }> = []

  while ((match = searchRegex.exec(txt)) !== null) {
    if (searchRegex.lastIndex > match.index) {
      chunks.push({
        start: match.index,
        end: searchRegex.lastIndex
      })

      if (match.index === searchRegex.lastIndex) {
        searchRegex.lastIndex++
      }
    }
  }

  let highlightedString = txt

  chunks.forEach((chunk, i) => {
    const startShift = highlightedString.length - txt.length
    const searchIndex = searchIndices?.[i] ?? -1
    const openMarkTags = `${highlightedString.slice(
      0,
      chunk.start + startShift
    )}<mark data-search-result-index="${searchIndex}" ${
      searchIndex === currentSearchIndex ? 'data-current-search-result="true"' : ''
    }>${highlightedString.slice(chunk.start + startShift)}`

    const endShift = openMarkTags.length - txt.length
    const closeMarkTags = `${openMarkTags.slice(0, chunk.end + endShift)}</mark>${openMarkTags.slice(
      chunk.end + endShift
    )}`

    highlightedString = closeMarkTags
  })

  return highlightedString
}

export interface MultiLogLineProps extends LogLineData {
  /**
   * Zero index based line number
   */
  lineNumber: number
  limit: number
  searchText: string
  currentSearchIndex: number
}

export function MultiLogLine(props: MultiLogLineProps): React.ReactElement {
  const { text = {}, lineNumber, limit, searchText, currentSearchIndex, searchIndices } = props

  return (
    <div className={css.logLine} style={{ '--char-size': `${limit.toString().length}ch` } as any}>
      <span className={css.lineNumber}>{lineNumber + 1}</span>
      <LogLine
        data={getTextWithSearchMarkers({
          txt: text.level,
          searchText,
          searchIndices: searchIndices?.level,
          currentSearchIndex
        })}
      />
      <span
        dangerouslySetInnerHTML={{
          __html: getTextWithSearchMarkers({
            txt: text.time,
            searchText,
            searchIndices: searchIndices?.time,
            currentSearchIndex
          })
        }}
      />
      <LogLine
        data={getTextWithSearchMarkers({
          txt: text.out,
          searchText,
          searchIndices: searchIndices?.out,
          currentSearchIndex
        })}
      />
    </div>
  )
}
