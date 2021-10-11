import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useChangeEventTimeline } from 'services/cv'
import type { ChangeTimelineProps } from './ChangeTimeline.types'
import { Timeline } from './components/Timeline/Timeline'
import { ChangeSourceTypes } from './ChangeTimeline.constants'
import {
  createChangeInfoCardData,
  createNoDataMessage,
  createTimelineSeriesData,
  getStartAndEndTime
} from './ChangeTimeline.utils'
import ChangeTimelineError from './components/ChangeTimelineError/ChangeTimelineError'

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

  const { data, refetch, loading, error } = useChangeEventTimeline({
    lazy: true,
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  })

  const { interval, startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min } = useMemo(
    () => getStartAndEndTime((selectedTimePeriod?.value as string) || ''),
    [selectedTimePeriod]
  )

  useEffect(() => {
    refetch({
      queryParams: {
        serviceIdentifiers: Array.isArray(serviceIdentifier) ? serviceIdentifier : [serviceIdentifier],
        envIdentifiers: Array.isArray(environmentIdentifier) ? environmentIdentifier : [environmentIdentifier],
        startTime: startTimeRoundedOffToNearest30min,
        endTime: endTimeRoundedOffToNearest30min
      }
    })
  }, [startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min, serviceIdentifier, environmentIdentifier])

  const { categoryTimeline } = data?.resource || {}
  const { Deployment, Infrastructure, Alert } = categoryTimeline || {}

  useEffect(() => {
    const changeInfoCardData = createChangeInfoCardData(
      startTime,
      endTime,
      Deployment,
      Infrastructure,
      Alert,
      getString
    )
    if (changeInfoCardData.length) {
      onSliderMoved?.(changeInfoCardData)
    }
  }, [startTime, endTime, Deployment, Infrastructure, Alert])

  if (error) {
    return <ChangeTimelineError error={getErrorMessage(error) || ''} />
  }

  return (
    <Timeline
      timelineRows={[
        {
          labelName: getString('deploymentsText'),
          timelineSeries: [
            createTimelineSeriesData(categoryTimeline?.Deployment, ChangeSourceTypes.Deployments, getString)
          ],
          isLoading: loading,
          noDataMessage: createNoDataMessage(
            categoryTimeline?.Deployment,
            ChangeSourceTypes.Deployments,
            selectedTimePeriod?.label,
            getString
          )
        },
        {
          labelName: getString('infrastructureText'),
          timelineSeries: [
            createTimelineSeriesData(categoryTimeline?.Infrastructure, ChangeSourceTypes.Infrastructure, getString)
          ],
          isLoading: loading,
          noDataMessage: createNoDataMessage(
            categoryTimeline?.Infrastructure,
            ChangeSourceTypes.Infrastructure,
            selectedTimePeriod?.label,
            getString
          )
        },
        {
          labelName: getString('cv.changeSource.tooltip.incidents'),
          timelineSeries: [createTimelineSeriesData(categoryTimeline?.Alert, ChangeSourceTypes.Incidents, getString)],
          isLoading: loading,
          noDataMessage: createNoDataMessage(
            categoryTimeline?.Alert,
            ChangeSourceTypes.Incidents,
            selectedTimePeriod?.label,
            getString
          )
        }
      ]}
      timestamps={[startTimeRoundedOffToNearest30min - interval, endTimeRoundedOffToNearest30min + interval]}
      timeFormat={timeFormat}
      labelWidth={90}
    />
  )
}
