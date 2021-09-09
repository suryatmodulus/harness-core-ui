import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MetricsAndLogs from '../MetricsAndLogs'
import type { MetricsAndLogsProps } from '../MetricsAndLogs.types'
import { mockedHealthSourcesData } from './MetricsAndLogs.mock'

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

jest.mock('services/cv', () => ({
  useGetAllLogsData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: fetchLogAnalysis })),
  useGetTimeSeriesMetricData: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: fetchMetricsData, error: null, loading: false }
  }),
  useGetAllHealthSourcesForServiceAndEnvironment: jest.fn().mockImplementation(() => {
    return { data: mockedHealthSourcesData, error: null, loading: false }
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
