import React from 'react'
import cx from 'classnames'
import { ansiToJson } from 'anser'
import { memoize } from 'lodash-es'
import { renderToString } from 'react-dom/server'

import './ansi-colors.scss'

import type { LineData } from './types'
import css from './MultiLogsViewer.module.scss'

// eslint-disable-next-line @typescript-eslint/camelcase
export const memoizedAnsiToJson = memoize((str: string) => ansiToJson(str, { use_classes: true }))

export function highlightedTextToReactNode(text: string): React.ReactElement {
  return React.createElement('span', {
    dangerouslySetInnerHTML: { __html: text }
  })
}

export function reactNodeToString(reactNode: React.ReactNode): string {
  let string = ''
  if (typeof reactNode === 'string') {
    string = reactNode
  } else if (typeof reactNode === 'number') {
    string = reactNode.toString()
  } else if (reactNode instanceof Array) {
    reactNode.forEach(function (child) {
      if (React.isValidElement(child)) {
        string += reactNodeToString(child.props.children)
      }
    })
  }
  return string
}

export interface LogLineChunkProps {
  data: LineData[]
  chunkNumber: number
  linesChunkSize: number
  style?: React.CSSProperties
}

// adopted from https://github.com/nteract/ansi-to-react/blob/master/src/index.ts
function linkifyText(content: string): string {
  const nodes: string[] = []
  const LINK_REGEX = /(\s+|^)(https?:\/\/(?:www\.|(?!www))[^\s.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g

  let index = 0
  let match: RegExpExecArray | null

  while ((match = LINK_REGEX.exec(content)) !== null) {
    const [, pre, url] = match

    const startIndex = match.index + pre.length

    if (startIndex > index) {
      nodes.push(content.substring(index, startIndex))
    }

    nodes.push(
      renderToString(
        <a key={index} href={url} target="_blank" rel="noreferrer noopener">
          {url}
        </a>
      )
    )

    index = LINK_REGEX.lastIndex
  }

  if (index < content.length) {
    nodes.push(content.substring(index))
  }

  return nodes.join('')
}

export interface LogLineProps {
  data: LineData
  lineNumber: number
}

/**
 * Component which renders individual lines
 */
export function LogLine(props: LogLineProps): React.ReactElement {
  const {
    data: { anserJson },
    lineNumber
  } = props

  return (
    <div className={css.logLine}>
      <div className={css.lineNumber}>{lineNumber}</div>
      <div className={css.line}>
        {anserJson.map((row, i) => {
          return (
            <span
              className={cx(
                {
                  [`${row.bg}-bg`]: row.bg,
                  [`${row.fg}-fg`]: row.fg
                },
                ...(row.decorations || []).map(p => `ansi-decoration-${p}`)
              )}
              key={`${row.content}_${i}`}
            >
              {highlightedTextToReactNode(linkifyText(row.content))}
            </span>
          )
        })}
      </div>
    </div>
  )
}

const LogLineMemoized = React.memo(LogLine, (prevProps, nextProps) => prevProps.data.raw === nextProps.data.raw)

/**
 * Component which renders bunch of lines together in the virtual list
 */
export function LogLineChunk(props: LogLineChunkProps): React.ReactElement {
  const { data, chunkNumber, linesChunkSize, style } = props

  return (
    <div style={style}>
      {data.map((row, index) => {
        return (
          <LogLineMemoized
            key={`${row.raw}-${index}`}
            data={row}
            lineNumber={linesChunkSize * chunkNumber + (1 + index)}
          />
        )
      })}
    </div>
  )
}
