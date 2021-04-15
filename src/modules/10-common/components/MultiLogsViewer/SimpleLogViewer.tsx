import React from 'react'
import cx from 'classnames'
import { Spinner } from '@blueprintjs/core'

import { LogLineProps, memoizedAnsiToJson } from './LogLine'
import type { LineData } from './types'
import css from './MultiLogsViewer.module.scss'

export interface SimpleLogViewerProps {
  data: string
  className?: string
  loading?: boolean
}

interface SimpleLogLineProps extends LogLineProps {
  key?: string
}

const SimpleLogLine = (props: SimpleLogLineProps) => {
  const {
    data: { anserJson },
    lineNumber,
    key
  } = props

  return (
    <div className={css.logLine} key={key}>
      <div className={css.lineNumber}>{lineNumber}</div>
      <div className={css.line}>
        {anserJson?.map((row, i) => {
          return (
            row.content && (
              <span
                id="log-level"
                className={`${css.logLineLevel} ${cx(
                  {
                    [`${row.bg}-bg`]: row.bg,
                    [`${row.fg}-fg`]: row.fg
                  },
                  ...(row.decorations || []).map(p => `ansi-decoration-${p}`)
                )}`}
                key={`${row.content}_${i}`}
                dangerouslySetInnerHTML={{ __html: row.content }}
              />
            )
          )
        })}
      </div>
    </div>
  )
}

export function SimpleLogViewer(props: SimpleLogViewerProps): React.ReactElement {
  const { data = '', className, loading } = props
  const linesData = React.useMemo(() => {
    return data.split(/\r?\n/).map<LineData>(line => ({
      raw: line,
      anserJson: memoizedAnsiToJson(line)
    }))
  }, [data])

  return (
    <div className={cx(css.logViewer, className)}>
      {loading ? (
        <Spinner />
      ) : (
        <pre>
          {linesData.map((row, index) => {
            return <SimpleLogLine data={row} lineNumber={index + 1} key={`${row.raw}_${index}`} />
          })}
        </pre>
      )}
    </div>
  )
}
