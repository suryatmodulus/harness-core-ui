import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { TimelineProps } from './Timeline.types'
import { TimelineRow } from '../TimelineRow/TimelineRow'
import { TimestampChart } from '../TimestampChart/TimestampChart'
import css from './Timeline.module.scss'

export function Timeline(props: TimelineProps): JSX.Element {
  const { timelineRows, timestamps, labelWidth, timeFormat } = props
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      {timelineRows?.map((timelineProps, index) => (
        <TimelineRow
          min={timestamps?.[0]}
          max={timestamps?.[timestamps?.length - 1]}
          labelWidth={labelWidth}
          {...timelineProps}
          key={`${timelineProps.labelName}-${index}`}
        />
      ))}
      <Container className={css.timelineChartContainer}>
        <Text className={css.timelineLabel} width={labelWidth}>
          {getString('cv.timeline').toUpperCase()}
        </Text>
        <TimestampChart timestamps={timestamps} timeFormat={timeFormat} />
      </Container>
    </Container>
  )
}
