import React, { useMemo } from 'react'
import { Color, Container, Layout, Text } from '@wings-software/uicore'
import moment from 'moment'
import {
  BUCKET_TOP_OFFSET,
  computePositionOnTimeline,
  findTimeIncrement,
  TOTAL_CARDS_PER_INTERVAL,
  computeTimelineHeight
} from '../ActivityTrack/ActivityTrackUtils'
import css from './ActivityTimelineIntervalMarker.module.scss'

interface ActivityTimelineIntervalMarkerProps {
  startTime: number
  endTime: number
}

function getMarkerPositions(startTime: number, endTime: number): Array<{ top: number; time: number }> {
  const { incrementLabel } = findTimeIncrement(startTime, endTime, TOTAL_CARDS_PER_INTERVAL)
  const { totalTimeDifference, timelineHeight } = computeTimelineHeight(startTime, endTime)
  const markerLabelTimeLocation = [{ top: BUCKET_TOP_OFFSET - 2, time: startTime }]
  const currDate = new Date(
    moment(startTime - 24 * 3600 * 1000)
      .add(24 - new Date(startTime).getHours(), incrementLabel)
      .valueOf()
  )
  currDate.setMinutes(0)
  currDate.setMilliseconds(0)
  let currTime = currDate.getTime()

  while (currTime >= endTime) {
    markerLabelTimeLocation.push({
      top: computePositionOnTimeline(startTime, currTime, totalTimeDifference, timelineHeight),
      time: currTime
    })
    currTime = currTime - 24 * 3600 * 1000
  }
  return markerLabelTimeLocation
}

export default function ActivityTimelineIntervalMarker(props: ActivityTimelineIntervalMarkerProps): JSX.Element {
  const { startTime, endTime } = props
  const markerLocations = useMemo(() => getMarkerPositions(startTime, endTime), [startTime, endTime])

  return (
    <Container className={css.main}>
      {markerLocations.map((markerLocation, index) => {
        const { time, top } = markerLocation
        return (
          <Container key={time} className={css.timeMarker} style={{ top }}>
            <Container width={50} style={{ borderTop: '1px solid var(--primary-7)' }}></Container>
            <Layout.Vertical style={{ flexGrow: 1 }}>
              <Text
                className={css.timeLabel}
                color={Color.WHITE}
                font={{ size: 'small' }}
                background={Color.BLUE_500}
              >{`${index === 0 ? 'Present: ' : ''} ${moment(time).format('MMMM D, YYYY h:mm a')}`}</Text>
              <Container background={Color.BLUE_200} height={70} className={css.totalActivities}></Container>
            </Layout.Vertical>
          </Container>
        )
      })}
    </Container>
  )
}
