/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { Container, Text } from '@wings-software/uicore'
import ColumnChart from '@cv/components/ColumnChart/ColumnChart'
import { useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ColumnData } from '@cv/components/ColumnChart/ColumnChart.types'
import type { HealthScoreChartProps } from './HealthScoreChart.types'
import { getSeriesData } from './HealthScoreChart.utils'
import type { TimePeriodEnum } from '../../ServiceHealth.constants'
import css from './HealthScoreChart.module.scss'

export default function HealthScoreChart(props: HealthScoreChartProps): JSX.Element {
  const {
    envIdentifier,
    serviceIdentifier,
    duration,
    setHealthScoreData,
    endTime,
    columChartProps,
    hasTimelineIntegration
  } = props
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const [seriesData, setSeriesData] = useState<ColumnData[]>([])

  const {
    data: healthScoreData,
    refetch: fetchHealthScore,
    loading,
    error
  } = useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv({
    queryParams: {
      environmentIdentifier: envIdentifier,
      serviceIdentifier,
      accountId,
      orgIdentifier,
      projectIdentifier,
      duration: duration?.value as TimePeriodEnum,
      endTime: endTime || Date.now()
    },
    lazy: true
  })

  useEffect(() => {
    if (envIdentifier && serviceIdentifier) {
      fetchHealthScore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration?.value, envIdentifier, serviceIdentifier])

  useEffect(() => {
    if (healthScoreData?.data?.healthScores && !isEmpty(healthScoreData?.data?.healthScores)) {
      const series = getSeriesData(healthScoreData.data.healthScores)
      setSeriesData(series)
      setHealthScoreData?.(healthScoreData.data.healthScores)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthScoreData])

  return (
    <Container className={css.main}>
      <Container className={css.timelineRow}>
        <Text width={90} className={css.rowLabel}>
          {getString('cv.monitoredServices.serviceHealth.overallHealthScore')}
        </Text>
        <ColumnChart
          hasTimelineIntegration={hasTimelineIntegration}
          data={seriesData}
          duration={duration}
          leftOffset={90}
          {...columChartProps}
          isLoading={loading}
          error={error}
          refetchOnError={fetchHealthScore}
        />
      </Container>
    </Container>
  )
}
