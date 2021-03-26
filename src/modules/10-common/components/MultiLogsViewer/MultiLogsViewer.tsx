import React from 'react'
import { GroupedVirtuoso } from 'react-virtuoso'
import { memoizedAnsiToJson, LogLine } from './LogLine'

import { LogViewerAccordion, LogViewerAccordionProps, LogViewerAccordionStatus } from './LogViewerAccordion'
import type { LineData } from './types'
import css from './MultiLogsViewer.module.scss'

export type MultiLogsViewerData = Omit<LogViewerAccordionProps, 'onSectionClick' | 'linesChunkSize'>

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
      const lines = row.formattedData.map<LineData>((line, index) => ({
        raw: line.level.concat(line.time, line.out),
        isOpen: row.isOpen,
        lineNumber: index,
        anserJsonLevel: memoizedAnsiToJson(line.level),
        anserJsonTime: memoizedAnsiToJson(line.time),
        anserJsonOut: memoizedAnsiToJson(line.out)
      }))

      return { linesData: lines, totalLines: lines.length, isOpen: row.isOpen }
    })
  }, [data])

  const groupCounts = memoizedData.map(row => {
    return row.totalLines
  })

  const flattenedRows = memoizedData
    .map(row => {
      return row.linesData
    })
    .reduce(function (prev, curr) {
      return prev.concat(curr)
    })

  return (
    <div className={css.multiLogViewer}>
      {flattenedRows.length ? (
        <GroupedVirtuoso
          id="logContent"
          ref={virtuosoRef}
          groupCounts={groupCounts}
          groupContent={index => (
            <LogViewerAccordion key={data[index].id} {...data[index]} onSectionClick={onSectionClick} />
          )}
          itemContent={index =>
            flattenedRows[index].isOpen ? (
              <div className={css.logViewer}>
                <LogLine
                  key={`${flattenedRows[index]}-${index}`}
                  data={flattenedRows[index]}
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  lineNumber={flattenedRows[index].lineNumber! + 1}
                />
              </div>
            ) : (
              <div style={{ height: '0.1px' }} />
            )
          }
        />
      ) : null}
    </div>
  )
}
