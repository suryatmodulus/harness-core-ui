/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MetricsAnalysisContainer from '../MetricsAnalysisContainer'
import type { MetricsAnalysisProps } from '../MetricsAnalysisContainer.types'
import { mockedHealthSourcesData } from '../../../__tests__/MetricsAndLogs.mock'
import { mockedMetricsData } from './MetricsAnalysisContainer.mock'

const WrapperComponent = (props: MetricsAnalysisProps): JSX.Element => {
  return (
    <TestWrapper>
      <MetricsAnalysisContainer {...props} />
    </TestWrapper>
  )
}

jest.mock('highcharts-react-official', () => () => <></>)
const fetchMetricsData = jest.fn()

jest.mock('services/cv', () => ({
  useGetTimeSeriesMetricData: jest.fn().mockImplementation(() => {
    return { data: mockedMetricsData, refetch: fetchMetricsData, error: null, loading: false }
  }),
  useGetAllHealthSourcesForServiceAndEnvironment: jest.fn().mockImplementation(() => {
    return { data: mockedHealthSourcesData, error: null, loading: false }
  })
}))

describe('Unit tests for MetricsAnalysisContainer', () => {
  const props = {
    serviceIdentifier: 'service-identifier',
    environmentIdentifier: 'env-identifier',
    startTime: 1630594988077,
    endTime: 1630595011443
  }
  test('Verify if MetricsAnalysisContainer renders', async () => {
    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('Verify if Metric View renders with correct number of records', async () => {
    const { container } = render(<WrapperComponent {...props} />)

    // verify default filter is Anomalous Metrics
    expect(container.querySelector('input[value="pipeline.verification.anomalousMetrics"]')).toBeInTheDocument()

    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Metrics View
    await waitFor(() =>
      expect(screen.getAllByTestId('metrics-analysis-row')).toHaveLength(mockedMetricsData.resource.content.length)
    )
  })
})
