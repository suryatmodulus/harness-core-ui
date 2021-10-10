import React, { useLayoutEffect, useRef, useState } from 'react'
import { PopoverInteractionKind, PopoverPosition } from '@blueprintjs/core'
import { Text, Container, Popover } from '@wings-software/uicore'
import { mapHealthBarRiskStatusToColor } from '@cv/pages/monitored-service/components/ServiceHealth/components/AnomaliesCard/AnomaliesCard.utils'
import type { ColumnChartProps } from './ColumnChart.types'
import { getTimestamps } from './ColumnChart.utils'
import { COLUMN_WIDTH, COLUMN_HEIGHT, TOTAL_COLUMNS } from './ColumnChart.constants'
import css from './ColumnChart.module.scss'

export default function ColumnChart(props: ColumnChartProps): JSX.Element {
  const { data, leftOffset = 0 } = props
  const containerRef = useRef<HTMLDivElement>(null)
  const [cellPositions, setCellPositions] = useState<number[]>(Array(TOTAL_COLUMNS).fill(null))
  useLayoutEffect(() => {
    if (!containerRef?.current) return
    const parentWidth = (containerRef.current.parentElement?.getBoundingClientRect().width || 0) - leftOffset
    setCellPositions(getTimestamps(parentWidth, data))
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
                  <Text inline>Health Score:</Text>
                  <Text className={css.healthScore} color={mapHealthBarRiskStatusToColor(cell.riskStatus as string)}>
                    {cell?.healthScore}
                  </Text>
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
