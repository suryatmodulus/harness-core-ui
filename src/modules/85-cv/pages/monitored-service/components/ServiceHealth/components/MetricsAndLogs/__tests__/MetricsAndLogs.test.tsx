/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MetricsAndLogs from '../MetricsAndLogs'
import type { MetricsAndLogsProps } from '../MetricsAndLogs.types'
import { mockedClustersData, mockedHealthSourcesData } from './MetricsAndLogs.mock'

const WrapperComponent = (props: MetricsAndLogsProps): JSX.Element => {
  return (
    <TestWrapper>
      <MetricsAndLogs {...props} />
    </TestWrapper>
  )
}

jest.mock('highcharts-react-official', () => () => <></>)
const fetchLogAnalysis = jest.fn()
const fetchMetricsData = jest.fn()
const fetchClusterData = jest.fn()

jest.mock('services/cv', () => ({
  useGetAllLogsData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: fetchLogAnalysis })),
  useGetTimeSeriesMetricData: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: fetchMetricsData, error: null, loading: false }
  }),
  useGetAllHealthSourcesForServiceAndEnvironment: jest.fn().mockImplementation(() => {
    return { data: mockedHealthSourcesData, error: null, loading: false }
  }),
  useGetAllLogsClusterData: jest.fn().mockImplementation(() => {
    return { data: mockedClustersData, error: null, loading: false, refetch: fetchClusterData }
  })
}))

describe('Unit tests for MetricsAndLogs', () => {
  test('Verify if Metrics and Logs View is rendered when required params are defined', async () => {
    const props = {
      serviceIdentifier: 'service-identifier',
      environmentIdentifier: 'env-identifier',
      startTime: 1630594988077,
      endTime: 1630595011443
    }
    const { getByTestId } = render(<WrapperComponent {...props} />)
    expect(getByTestId('analysis-view')).toBeTruthy()
  })

  test('Verify if appropriate image is rendered when start or endtime is not present', async () => {
    const props = {
      serviceIdentifier: 'service-identifier',
      environmentIdentifier: 'env-identifier',
      startTime: 0,
      endTime: 0
    }
    const { getByTestId } = render(<WrapperComponent {...props} />)
    expect(getByTestId('analysis-image-view')).toBeTruthy()
  })
})
