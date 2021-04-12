import React from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'

import { LogLine, memoizedAnsiToJson } from './LogLine'

import { LogViewerAccordion, LogViewerAccordionProps, LogViewerAccordionStatus } from './LogViewerAccordion'
import type { FormattedLogLine } from './types'
import css from './MultiLogsViewer.module.scss'

export type MultiLogsViewerData = Omit<LogViewerAccordionProps, 'onSectionClick' | 'linesChunkSize'> & {
  formattedData: FormattedLogLine[]
}

export type { LogViewerAccordionStatus, LogViewerAccordionProps }

export interface MultiLogsViewerProps {
  /**
   * data for the component.
   */
  data: MultiLogsViewerData[]
  /**
   * Callback triggered on click of a section summary.
   *
   * You can return `false` from this function to use
   * the component in controlled mode.
   */
  onSectionClick?: LogViewerAccordionProps['onSectionClick']
  virtuosoRef: React.MutableRefObject<null>
  previousRowCounts: number[]
}

export function MultiLogsViewer(props: MultiLogsViewerProps): React.ReactElement {
  const { data, onSectionClick, virtuosoRef } = props

  const memoizedData = React.useMemo(() => {
    return data.map(row => {
      const lines = row.formattedData.map((line, index) => {
        return {
          ...line,
          level: memoizedAnsiToJson(line.level),
          time: memoizedAnsiToJson(line.time),
          out: memoizedAnsiToJson(line.out),
          lineNumber: index,
          sectionId: row.id,
          raw: `${line.level}${line.time}${line.out}`
        }
      })

      return {
        linesData: lines,
        totalLines: lines.length,
        isOpen: row.isOpen,
        title: row.title,
        status: row.status,
        startTime: row.startTime,
        endTime: row.endTime,
        id: row.id
      }
    })
  }, [data])

  const flattenedRows = memoizedData
    .map(row => {
      return row.isOpen ? row.linesData : []
    })
    .reduce(function (prev, curr) {
      return prev.concat(curr)
    })

  return (
    <div className={css.multiLogViewer}>
      <GroupedVirtuoso
        id="logContent"
        ref={virtuosoRef}
        groupCounts={memoizedData.map(row => (row.isOpen ? row.totalLines : 0))}
        groupContent={index => (
          <LogViewerAccordion key={memoizedData[index].id} {...memoizedData[index]} onSectionClick={onSectionClick} />
        )}
        itemContent={index =>
          flattenedRows.length > 0 && flattenedRows[index].raw.length > 0 ? (
            <div className={css.logViewer}>
              {memoizedData.filter(row => row.id === flattenedRows[index].sectionId && row.isOpen).length > 0 ? (
                <LogLine data={flattenedRows[index]} lineNumber={flattenedRows[index].lineNumber + 1} />
              ) : (
                <div style={{ height: '1px' }} />
              )}
            </div>
          ) : (
            <div style={{ height: '1px' }} />
          )
        }
      />
    </div>
  )
}
