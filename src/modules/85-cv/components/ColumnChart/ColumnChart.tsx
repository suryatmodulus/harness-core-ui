import React, { useLayoutEffect, useRef, useState } from 'react'
import { PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { Text, Container, Popover, Color } from '@wings-software/uicore'
import { getRiskColorValue, RiskValues } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import type { ColumnChartProps } from './ColumnChart.types'
import { getTimestamps } from './ColumnChart.utils'
import { COLUMN_WIDTH, COLUMN_HEIGHT, TOTAL_COLUMNS } from './ColumnChart.constants'
import css from './ColumnChart.module.scss'

export default function ColumnChart(props: ColumnChartProps): JSX.Element {
  const { data, leftOffset = 0 } = props
  const { getString } = useStrings()
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellPositions, setCellPositions] = useState<number[]>(Array(TOTAL_COLUMNS).fill(null))

  useLayoutEffect(() => {
    if (!containerRef?.current) return
    const parentWidth = (containerRef.current.parentElement?.getBoundingClientRect().width || 0) - leftOffset
    setCellPositions(getTimestamps(parentWidth, data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef?.current, data])

  return (
    <div ref={containerRef} className={css.main}>
      {cellPositions.map((position, index) => {
        const cell = data?.[index] || {}
        return (
          <div
            key={index}
            style={{
              backgroundColor: cell.color,
              left: position || 0,
              height: Math.floor(((cell.height || 0) / 100) * COLUMN_HEIGHT)
            }}
            className={css.bar}
          >
            <Popover
              content={
                <>
                  <Text lineClamp={1} className={css.timeRange}>{`${new Date(
                    cell.timeRange?.startTime
                  ).toLocaleString()} - ${new Date(cell.timeRange?.endTime).toLocaleString()}`}</Text>
                  {cell.riskStatus === RiskValues.NO_DATA ? (
                    <Text color={Color.WHITE}>{getString('noData')}</Text>
                  ) : (
                    <>
                      <Text color={Color.WHITE} inline>
                        {`${getString('cv.monitoredServices.serviceHealth.healthScore')}:`}
                      </Text>
                      <Text className={css.healthScore} color={getRiskColorValue(cell.riskStatus, false)}>
                        {cell?.healthScore}
                      </Text>
                    </>
                  )}
                </>
              }
              position={PopoverPosition.TOP}
              popoverClassName={css.chartPopover}
              interactionKind={PopoverInteractionKind.HOVER}
            >
              <Container height={COLUMN_HEIGHT} width={COLUMN_WIDTH} />
            </Popover>
          </div>
        )
      })}
    </div>
  )
}
