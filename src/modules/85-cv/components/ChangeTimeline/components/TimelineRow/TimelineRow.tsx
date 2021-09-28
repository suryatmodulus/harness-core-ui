import React, { useMemo } from 'react'
import { Container, Text } from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import type { TimelineRowProps } from './TimelineRow.types'
import { getEventTimelineConfig } from './TimelineRow.utils'
import css from './TimelineRow.module.scss'

export function TimelineRow(props: TimelineRowProps): JSX.Element {
  const { labelName, labelWidth, timelineSeries, min, max } = props
  const options = useMemo(() => getEventTimelineConfig(timelineSeries || [], { min, max }), [timelineSeries])

  return (
    <Container className={css.main}>
      <Container key={labelName} className={css.timelineRow}>
        <Text lineClamp={1} width={labelWidth} className={css.rowLabel}>
          {labelName}
        </Text>
        <HighchartsReact highcharts={Highcharts} options={options} />
      </Container>
    </Container>
  )
}
