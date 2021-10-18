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
import css from './HealthScoreChart.module.scss'

export default function HealthScoreChart(props: HealthScoreChartProps): JSX.Element {
  const { envIdentifier, serviceIdentifier, duration, setHealthScoreData, endTime, columChartProps } = props
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
      duration,
      endTime: endTime || Date.now()
    },
    lazy: true
  })

  useEffect(() => {
    if (envIdentifier && serviceIdentifier) {
      fetchHealthScore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, envIdentifier, serviceIdentifier])

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
          data={seriesData}
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
