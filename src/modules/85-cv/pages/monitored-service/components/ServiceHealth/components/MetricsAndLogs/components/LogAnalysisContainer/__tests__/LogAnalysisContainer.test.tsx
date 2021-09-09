import React from 'react'
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import LogAnalysisContainer from '../LogAnalysisContainer'
import type { MetricsAndLogsProps } from '../../../MetricsAndLogs.types'
import { mockedLogAnalysisData } from './LogAnalysisContainer.mocks'
import { mockedHealthSourcesData } from '../../../__tests__/MetricsAndLogs.mock'

const WrapperComponent = (props: MetricsAndLogsProps): JSX.Element => {
  return (
    <TestWrapper>
      <LogAnalysisContainer {...props} />
    </TestWrapper>
  )
}

jest.mock('highcharts-react-official', () => () => <></>)
const fetchLogAnalysis = jest.fn()

jest.mock('services/cv', () => ({
  useGetAllLogsData: jest.fn().mockImplementation(() => ({
    data: mockedLogAnalysisData,
    loading: false,
    error: null,
    refetch: fetchLogAnalysis
  })),
  useGetAllHealthSourcesForServiceAndEnvironment: jest.fn().mockImplementation(() => {
    return { data: mockedHealthSourcesData, error: null, loading: false }
  })
}))

describe('Unit tests for LogAnalysisContainer', () => {
  const props = {
    serviceIdentifier: 'service-identifier',
    environmentIdentifier: 'env-identifier',
    startTime: 1630594988077,
    endTime: 1630595011443
  }
  test('Verify if LogAnalysisContainer renders', async () => {
    const { container } = render(<WrapperComponent {...props} />)
    expect(container).toMatchSnapshot()
  })

  test('Verify if Logs Cluster Chart and Logs Record Table is rendered correctly', async () => {
    render(<WrapperComponent {...props} />)

    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(mockedLogAnalysisData.resource.content.length)
    )
  })

  test('Verify if Filtering by cluster type works correctly', async () => {
    const { container, getByText, getAllByText } = render(<WrapperComponent {...props} />)

    const clusterTypeFilterDropdown = container.querySelector(
      'input[placeholder="pipeline.verification.logs.filterByClusterType"]'
    ) as HTMLInputElement

    expect(clusterTypeFilterDropdown).toBeTruthy()

    // Clicking the filter dropdown
    const selectCaret = container
      .querySelector(`[placeholder="pipeline.verification.logs.filterByClusterType"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(selectCaret!)
    })

    // Selecting Known event cluster type
    const typeToSelect = await getByText('pipeline.verification.logs.knownEvent')
    act(() => {
      fireEvent.click(typeToSelect)
    })
    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.knownEvent')

    // Verifying if correct number of records are shown for Known event type.
    const knownClusterTypeMockedData = mockedLogAnalysisData.resource.content.filter(el => el.logData.tag === 'KNOWN')
    await waitFor(() => expect(getAllByText('Known')).toHaveLength(knownClusterTypeMockedData.length))

    // Selecting UnKnown event cluster type
    const unknownEventTypeSelected = await getByText('pipeline.verification.logs.unknownEvent')
    act(() => {
      fireEvent.click(unknownEventTypeSelected)
    })
    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.unknownEvent')

    // Verifying if correct number of records are shown for unKnown event type.
    const unknownClusterTypeMockedData = mockedLogAnalysisData.resource.content.filter(
      el => el.logData.tag === 'UNKNOWN'
    )
    await waitFor(() => expect(getAllByText('Unknown')).toHaveLength(unknownClusterTypeMockedData.length))
  })
})
