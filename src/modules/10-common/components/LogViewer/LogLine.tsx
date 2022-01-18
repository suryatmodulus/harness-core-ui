/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ansiToJson } from 'anser'
import cx from 'classnames'
import { breakOnLinks } from '@common/components/LinkifyText/LinkifyText'

import css from './LogLine.module.scss'

function linkyText(txt: string): string {
  return breakOnLinks(txt)
    .map(textItem => {
      if (textItem.type === 'URL') {
        return `<a href="${textItem.content}" class="ansi-decoration-link" target="_blank" rel="noreferrer">${textItem.content}</a>`
      }

      return textItem.content
    })
    .join('')
}

export interface LogLineProps {
  data: string
  skipLinkify?: boolean
  className?: string
}

export function LogLine(props: LogLineProps): React.ReactElement {
  const { data, skipLinkify, className } = props
  const anserJson = React.useMemo(() => {
    return ansiToJson(skipLinkify ? data : linkyText(data), { use_classes: true })
  }, [data, skipLinkify])

  return (
    <span className={cx(css.logLine, className)}>
      {anserJson?.map((row, i) => {
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
            dangerouslySetInnerHTML={{ __html: row.content }}
          />
        )
      })}
    </span>
  )
}

export const MemoizedLogLine = React.memo(LogLine)
