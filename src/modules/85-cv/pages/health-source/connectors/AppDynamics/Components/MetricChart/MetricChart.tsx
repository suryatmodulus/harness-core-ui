import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import type { GetDataError } from 'restful-react'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAppdynamicsMetricDataByPath } from 'services/cv'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'

export default function MetricChart({
  connectorIdentifier,
  appName,
  baseFolder,
  tier,
  metricPath
}: {
  connectorIdentifier: string
  appName: string
  baseFolder: string
  tier: string
  metricPath: string
}): JSX.Element {
  const { data, refetch, loading, error } = useGetAppdynamicsMetricDataByPath({ lazy: true })
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  useEffect(() => {
    refetch({
      queryParams: {
        accountId,
        orgIdentifier,
        projectIdentifier,
        connectorIdentifier,
        appName,
        baseFolder,
        tier,
        metricPath
      }
    })
  }, [metricPath])

  const dataPoints = data?.data?.dataPoints
  const options: any[] = []
  dataPoints?.forEach((point: any) => {
    options.push([point?.timestamp * 1000, point?.value])
  })

  return (
    <Container>
      <MetricLineChart options={options} loading={loading} error={error as GetDataError<Error>} />
    </Container>
  )
}
