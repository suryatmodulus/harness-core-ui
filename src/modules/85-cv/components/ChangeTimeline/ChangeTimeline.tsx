import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
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
    serviceIdentifier,
    environmentIdentifier,
    startTime,
    endTime,
    selectedTimePeriod,
    onSliderMoved,
    changeCategories,
    changeSourceTypes,
    hideTimeline
  } = props

  const { data, refetch, loading, error, cancel } = useChangeEventTimeline({
    lazy: true,
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  })

  const { startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min } = useMemo(() => {
    if (hideTimeline) {
      return {
        startTimeRoundedOffToNearest30min: startTime as number,
        endTimeRoundedOffToNearest30min: endTime as number
      }
    } else {
      return getStartAndEndTime((selectedTimePeriod?.value as string) || '')
    }
  }, [endTime, selectedTimePeriod?.value, hideTimeline, startTime])

  useEffect(() => {
    cancel()
    refetch({
      queryParams: {
        serviceIdentifiers: Array.isArray(serviceIdentifier) ? serviceIdentifier : [serviceIdentifier],
        envIdentifiers: Array.isArray(environmentIdentifier) ? environmentIdentifier : [environmentIdentifier],
        changeCategories: changeCategories || [],
        changeSourceTypes: changeSourceTypes || [],
        startTime: startTimeRoundedOffToNearest30min as number,
        endTime: endTimeRoundedOffToNearest30min as number
      },
      queryParamStringifyOptions: {
        arrayFormat: 'repeat'
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    startTimeRoundedOffToNearest30min,
    endTimeRoundedOffToNearest30min,
    changeCategories,
    changeSourceTypes,
    serviceIdentifier,
    environmentIdentifier
  ])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime, Deployment, Infrastructure, Alert])

  if (error) {
    return <ChangeTimelineError error={getErrorMessage(error) || ''} />
  }

  return (
    <Timeline
      isLoading={loading}
      rowOffset={90}
      timelineRows={[
        {
          labelName: getString('deploymentsText'),
          data: createTimelineSeriesData(ChangeSourceTypes.Deployments, getString, categoryTimeline?.Deployment),
          noDataMessage: createNoDataMessage(
            categoryTimeline?.Deployment,
            ChangeSourceTypes.Deployments,
            selectedTimePeriod?.label,
            getString
          )
        },
        {
          labelName: getString('infrastructureText'),
          data: createTimelineSeriesData(ChangeSourceTypes.Infrastructure, getString, categoryTimeline?.Infrastructure),
          noDataMessage: createNoDataMessage(
            categoryTimeline?.Infrastructure,
            ChangeSourceTypes.Infrastructure,
            selectedTimePeriod?.label,
            getString
          )
        },
        {
          labelName: getString('cv.changeSource.tooltip.incidents'),
          data: createTimelineSeriesData(ChangeSourceTypes.Incidents, getString, categoryTimeline?.Alert),
          noDataMessage: createNoDataMessage(
            categoryTimeline?.Alert,
            ChangeSourceTypes.Incidents,
            selectedTimePeriod?.label,
            getString
          )
        }
      ]}
      timestamps={[startTimeRoundedOffToNearest30min, endTimeRoundedOffToNearest30min]}
      labelWidth={90}
      hideTimeline={hideTimeline}
    />
  )
}
