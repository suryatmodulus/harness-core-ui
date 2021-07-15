import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import moment from 'moment'
import { computePositionOnTimeline, computeTimelineHeight } from '../ActivityTrack/ActivityTrackUtils'
import { getScrubberLaneDataHeight } from '../ActivityTimelineScrubber/ActivityTimelineScrubberUtils'

interface ActivityTimelineScrollHookInput {
  timelineContainerRef: HTMLDivElement | null
  timelineScrubberLaneRef: HTMLDivElement | null
  scrubberRef: React.Component | null
  timelineStartTime: number
  timelineEndTime: number
}

type TimestampThreshold = {
  timestamp: number
  yScrollOffset: number
}

function computeElementBorderBoxHeight(element: HTMLDivElement | null) {
  if (!element) return 0
  const elementStyles = window.getComputedStyle(element)
  return (
    element.getBoundingClientRect().height -
    parseFloat(elementStyles.paddingTop) +
    parseFloat(elementStyles.paddingBottom)
  )
}

function computeTimestampThresholds(
  timelineStartTime: number,
  timelineEndTime: number,
  totalTimeDifference: number,
  timelineHeight: number
): TimestampThreshold[] {
  const timestampThresholds = []
  for (let currTime = timelineStartTime; currTime !== timelineEndTime; ) {
    const subtract4Weeks = moment(currTime).subtract(4, 'weeks').valueOf()
    currTime = subtract4Weeks < timelineEndTime ? timelineEndTime : subtract4Weeks
    // offset is too call api before it hits threshold
    const positionWithOffset =
      computePositionOnTimeline(timelineStartTime, currTime, totalTimeDifference, timelineHeight) - 200
    timestampThresholds.push({
      timestamp: currTime,
      yScrollOffset: positionWithOffset < 0 ? 200 : positionWithOffset
    })
  }
  return timestampThresholds
}

export default function useActivityTimelineScrollHook(input: ActivityTimelineScrollHookInput) {
  const { timelineContainerRef, timelineScrubberLaneRef, timelineStartTime, timelineEndTime, scrubberRef } = input
  const { timelineHeight, totalTimeDifference } = computeTimelineHeight(timelineStartTime, timelineEndTime)
  const scrubberLaneHeight = useMemo(
    () => computeElementBorderBoxHeight(timelineScrubberLaneRef),
    [timelineScrubberLaneRef]
  )
  const scrollThresholds = useMemo(
    () => computeTimestampThresholds(timelineStartTime, timelineEndTime, totalTimeDifference, timelineHeight),
    [timelineStartTime, timelineEndTime, timelineHeight, totalTimeDifference]
  )
  const [currThresholdIndex, setCurrentThresholdIndex] = useState<number>(0)
  const onScrollTimelineContainerCallback = useCallback(
    e => {
      if (!timelineContainerRef) return
      if (e.target?.scrollTop >= scrollThresholds[currThresholdIndex].yScrollOffset) {
        // TODO load more data
        if (currThresholdIndex + 1 < scrollThresholds.length) {
          timelineContainerRef.removeEventListener('scroll', onScrollTimelineContainerCallback)
          setCurrentThresholdIndex(currThresholdIndex + 1)
        }
      }

      if (!timelineScrubberLaneRef) return
      const updatedYOffset =
        (e.target.scrollTop /
          computePositionOnTimeline(timelineStartTime, timelineEndTime, totalTimeDifference, timelineHeight)) *
        getScrubberLaneDataHeight(timelineStartTime, timelineEndTime, scrubberLaneHeight)
      scrubberRef?.setState({
        position: {
          x: 0,
          y: updatedYOffset
        },
        x: 0,
        y: updatedYOffset
      })
    },
    [
      timelineStartTime,
      timelineEndTime,
      timelineScrubberLaneRef,
      scrollThresholds,
      currThresholdIndex,
      scrubberRef,
      timelineScrubberLaneRef,
      timelineContainerRef,
      timelineHeight,
      scrubberLaneHeight,
      totalTimeDifference
    ]
  )

  const onScrubberPositionChange = useCallback(
    updatedPosition => {
      if (!timelineContainerRef) return
      timelineContainerRef.scrollTo(
        0,
        (updatedPosition.y / getScrubberLaneDataHeight(timelineStartTime, timelineEndTime, scrubberLaneHeight)) *
          computePositionOnTimeline(timelineStartTime, timelineEndTime, totalTimeDifference, timelineHeight)
      )
    },
    [scrollThresholds, currThresholdIndex, scrubberLaneHeight, timelineContainerRef]
  )

  useLayoutEffect(() => {
    if (!timelineContainerRef) return
    timelineContainerRef.addEventListener('scroll', onScrollTimelineContainerCallback)
    return () => timelineContainerRef?.removeEventListener('scroll', onScrollTimelineContainerCallback)
  }, [onScrollTimelineContainerCallback, timelineContainerRef])

  return { onScrubberPositionChange }
}
