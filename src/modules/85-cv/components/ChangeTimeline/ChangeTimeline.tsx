import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useChangeEventTimeline } from 'services/cv'
import type { ChangeTimelineProps } from './ChangeTimeline.types'
import { Timeline } from './components/Timeline/Timeline'
import { ChangeSourceTypes } from './ChangeTimeline.constants'
import { createChangeInfoCardData, createTimelineSeriesData, getStartAndEndTime } from './ChangeTimeline.utils'

export default function ChangeTimeline(props: ChangeTimelineProps): JSX.Element {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const {
    timeFormat,
    serviceIdentifier,
    environmentIdentifier,
    startTime,
    endTime,
    selectedTimePeriod,
    onSliderMoved
  } = props

  const { data, refetch } = useChangeEventTimeline({
    lazy: true,
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  })

  const { interval, startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min } = useMemo(
    () => getStartAndEndTime(selectedTimePeriod || ''),
    [selectedTimePeriod]
  )

  useEffect(() => {
    refetch({
      queryParams: {
        serviceIdentifiers: [serviceIdentifier],
        envIdentifiers: [environmentIdentifier],
        startTime: startTimeRoundedOffToNearest30min,
        endTime: endTimeRoundedOffToNearest30min
      }
    })
  }, [startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min, serviceIdentifier, environmentIdentifier])

  const { categoryTimeline } = data?.resource || {}
  const { Deployment, Infrastructure, Alert } = categoryTimeline || {}

  useEffect(() => {
    const changeInfoCardData = createChangeInfoCardData(startTime, endTime, Deployment, Infrastructure, Alert)
    if (changeInfoCardData.length) {
      onSliderMoved?.(changeInfoCardData)
    }
  }, [startTime, endTime, Deployment, Infrastructure, Alert])

  return (
    <Timeline
      timelineRows={[
        {
          labelName: getString('deploymentsText'),
          timelineSeries: [
            createTimelineSeriesData(categoryTimeline?.Deployment, ChangeSourceTypes.Deployments, getString)
          ]
        },
        {
          labelName: getString('infrastructureText'),
          timelineSeries: [
            createTimelineSeriesData(categoryTimeline?.Infrastructure, ChangeSourceTypes.Infrastructure, getString)
          ]
        },
        {
          labelName: getString('cv.changeSource.tooltip.incident'),
          timelineSeries: [createTimelineSeriesData(categoryTimeline?.Alert, ChangeSourceTypes.Incidents, getString)]
        }
      ]}
      timestamps={[startTimeRoundedOffToNearest30min - interval, endTimeRoundedOffToNearest30min + interval]}
      timeFormat={timeFormat}
      labelWidth={90}
    />
  )
}
