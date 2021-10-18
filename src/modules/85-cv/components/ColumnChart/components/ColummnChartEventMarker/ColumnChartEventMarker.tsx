import React from 'react'
import { Container } from '@wings-software/uicore'
import type { ColumnChartEventMarkerProps } from './ColumnChartEventMarker.types'
import css from './ColumnChartEventMarker.module.scss'

export default function ColumnChartEventMarker(props: ColumnChartEventMarkerProps): JSX.Element {
  const { columnHeight, leftOffset, markerColor } = props
  return (
    <Container
      className={css.eventMarker}
      style={{ height: columnHeight + 60, left: leftOffset, borderColor: markerColor }}
    >
      <Container className={css.eventMarkerSquare} style={{ backgroundColor: markerColor }} />
    </Container>
  )
}
