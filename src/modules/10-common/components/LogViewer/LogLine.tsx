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
}

export function LogLine(props: LogLineProps): React.ReactElement {
  const { data } = props
  const anserJson = React.useMemo(() => {
    return ansiToJson(linkyText(data), { use_classes: true })
  }, [data])

  return (
    <span className={css.logLine}>
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
