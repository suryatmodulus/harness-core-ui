/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
