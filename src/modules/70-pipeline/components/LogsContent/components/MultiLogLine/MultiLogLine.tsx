/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'

import { LogLine } from '@common/components/LogViewer/LogLine'
import { breakOnLinks } from '@common/components/LinkifyText/LinkifyText'

import { getRegexForSearch } from '../../LogsState/utils'
import type { LogLineData } from '../../LogsState/types'
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
    return defaultTo(txt, '')
  }

  if (!txt) {
    return ''
  }

  const searchRegex = getRegexForSearch(searchText)

  let match: RegExpExecArray | null
  const chunks: Array<{ start: number; end: number }> = []

  while ((match = searchRegex.exec(txt)) !== null) {
    /* istanbul ignore else */
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
    const searchIndex = defaultTo(searchIndices?.[i], -1)
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

export function getTextWithSearchMarkersAndLinks(props: GetTextWithSearchMarkersProps): string {
  const { txt, searchText } = props

  if (!txt) {
    return ''
  }

  const searchRegex = getRegexForSearch(defaultTo(searchText, ''))

  let offset = 0
  return breakOnLinks(txt)
    .map(textItem => {
      const matches = searchText ? defaultTo(textItem.content.match(searchRegex), []) : []

      const highligtedText = getTextWithSearchMarkers({
        ...props,
        txt: textItem.content,
        searchIndices: props.searchIndices?.slice(offset)
      })

      offset += matches.length

      if (textItem.type === 'URL') {
        return `<a href="${textItem.content}" class="ansi-decoration-link" target="_blank" rel="noreferrer">${highligtedText}</a>`
      }

      return highligtedText
    })
    .join('')
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
        skipLinkify
        className={css.level}
        data={getTextWithSearchMarkers({
          txt: text.level,
          searchText,
          searchIndices: searchIndices?.level,
          currentSearchIndex
        })}
      />
      <span
        className={css.time}
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
        skipLinkify
        data={getTextWithSearchMarkersAndLinks({
          txt: text.out,
          searchText,
          searchIndices: searchIndices?.out,
          currentSearchIndex
        })}
      />
    </div>
  )
}
