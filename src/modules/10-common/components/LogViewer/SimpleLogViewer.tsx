import React from 'react'
import cx from 'classnames'
import { Spinner } from '@blueprintjs/core'

import { LogLine, LogLineProps } from './LogLine'
import css from './SimpleLogViewer.module.scss'

export interface SimpleLogViewerProps {
  data: string
  className?: string
  loading?: boolean
}

export interface SimpleLogLineProps extends LogLineProps {
  lineNumber: number
}

export function SimpleLogLine(props: SimpleLogLineProps) {
  return (
    <div className={css.line}>
      <span className={css.lineNumber}>{props.lineNumber}</span>
      <LogLine data={props.data} />
    </div>
  )
}

export function SimpleLogViewer(props: SimpleLogViewerProps): React.ReactElement {
  const { data = '', className, loading } = props
  const linesData = React.useMemo(() => {
    return data.split(/\r?\n/)
  }, [data])

  return (
    <div
      className={cx(css.logViewer, className)}
      style={{ '--char-size': `${linesData.length.toString().length + 1}ch` } as any}
    >
      {loading ? (
        <Spinner />
      ) : (
        <pre>
          {linesData.map((row, index) => {
            return <SimpleLogLine data={row} lineNumber={index + 1} key={`${row}_${index}`} />
          })}
        </pre>
      )}
    </div>
  )
}
