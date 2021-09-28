import React, { useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'react-router'
import { Color, Container, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useChangeEventTimeline } from 'services/cv'
import noDataImage from '@cv/assets/noData.svg'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { PageError } from '@common/components/Page/PageError'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { ChangeTimelineProps } from './ChangeTimeline.types'
import { Timeline } from './components/Timeline/Timeline'
import { ChangeSourceTypes } from './ChangeTimeline.constants'
import { createChangeInfoCardData, createTimelineSeriesData, getStartAndEndTime } from './ChangeTimeline.utils'
import css from './ChangeTimeline.module.scss'

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

  const renderChangesTimelineChart = useCallback(() => {
    if (error) {
      return (
        <Container className={css.changeContainer}>
          <PageError
            message={getErrorMessage(error)}
            onClick={() =>
              refetch({
                queryParams: {
                  serviceIdentifiers: [serviceIdentifier],
                  envIdentifiers: [environmentIdentifier],
                  startTime: startTimeRoundedOffToNearest30min,
                  endTime: endTimeRoundedOffToNearest30min
                }
              })
            }
          />
        </Container>
      )
    } else if (loading) {
      return (
        <Container className={css.changeContainer}>
          <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
        </Container>
      )
    } else if (!categoryTimeline) {
      return (
        <Container className={css.changeContainer}>
          <NoDataCard
            message={getString('cv.changeSource.noData')}
            image={noDataImage}
            imageClassName={css.noDataImage}
            containerClassName={css.noData}
          />
        </Container>
      )
    } else {
      return (
        <Timeline
          timelineRows={[
            {
              labelName: getString('deploymentsText'),
              timelineSeries: [createTimelineSeriesData(categoryTimeline?.Deployment, ChangeSourceTypes.Deployments)]
            },
            {
              labelName: getString('infrastructureText'),
              timelineSeries: [
                createTimelineSeriesData(categoryTimeline?.Infrastructure, ChangeSourceTypes.Infrastructure)
              ]
            },
            {
              labelName: getString('cv.changeSource.tooltip.incident'),
              timelineSeries: [createTimelineSeriesData(categoryTimeline?.Alert, ChangeSourceTypes.Incidents)]
            }
          ]}
          timestamps={[startTimeRoundedOffToNearest30min - interval, endTimeRoundedOffToNearest30min + interval]}
          timeFormat={timeFormat}
          labelWidth={90}
        />
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, loading, Deployment, Infrastructure, Alert])
  return <>{renderChangesTimelineChart()}</>
}
