import React from 'react'
import { render, waitFor, screen, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import { mockedLogAnalysisData, mockedLogChartsData } from './LogAnalysisContainer.mocks'
import LogAnalysisContainer from '../LogAnalysisView.container'
import type { LogAnalysisContainerProps } from '../LogAnalysis.types'

const WrapperComponent = (props: LogAnalysisContainerProps): JSX.Element => {
  return (
    <TestWrapper
      path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/pipeline/executions/:executionId/pipeline"
      pathParams={{
        accountId: '1234_accountId',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG',
        executionId: 'Test_execution'
      }}
    >
      <LogAnalysisContainer {...props} />
    </TestWrapper>
  )
}

const fetchLogsAnalysisData = jest.fn()
const fetchChartsAnalysisData = jest.fn()

jest.mock('services/cv', () => ({
  useGetDeploymentLogAnalysisResult: jest.fn().mockImplementation(() => {
    return { data: mockedLogAnalysisData, refetch: fetchLogsAnalysisData, error: null, loading: false }
  }),
  useGetDeploymentLogAnalysisClusters: jest.fn().mockImplementation(() => {
    return { data: mockedLogChartsData, refetch: fetchChartsAnalysisData, error: null, loading: false }
  })
}))

describe('Unit tests for LogAnalysisContainer', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const initialProps = {
    step: {
      progressData: {
        activityId: 'activityId-1'
      }
    } as unknown as ExecutionNode,
    hostName: 'hostName-1'
  }
  test('Verify if Logs Cluster Chart and Logs Record Table is rendered correctly', async () => {
    const { getByText } = render(<WrapperComponent {...initialProps} />)

    // Verify if Log Cluster Chart is rendered
    const logClusterChart = getByText('pipeline.verification.logs.logCluster')
    await waitFor(() => expect(logClusterChart).not.toBeNull())

    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(mockedLogAnalysisData.resource.content.length)
    )
  })

  test('Verify if apis for fetching logs data and cluster data is called with correct query params when hostname is not present', async () => {
    const newProps = { ...initialProps, hostName: '' }
    render(<WrapperComponent {...newProps} />)

    await waitFor(() => {
      expect(fetchLogsAnalysisData).toHaveBeenCalledWith({
        queryParams: { accountId: '1234_accountId', pageNumber: 0, pageSize: 10 }
      })
      expect(fetchChartsAnalysisData).toHaveBeenCalledWith({
        queryParams: { accountId: '1234_accountId' }
      })
    })
  })

  test('Verify if apis for fetching logs data and cluster data are called with correct query params when hostname is present', async () => {
    render(<WrapperComponent {...initialProps} />)
    await waitFor(() => {
      expect(fetchLogsAnalysisData).toHaveBeenCalledWith({
        queryParams: {
          accountId: '1234_accountId',
          pageNumber: 0,
          pageSize: 10,
          hostName: initialProps.hostName
        }
      })

      expect(fetchChartsAnalysisData).toHaveBeenCalledWith({
        queryParams: {
          accountId: '1234_accountId',
          hostName: initialProps.hostName
        }
      })
    })
  })

  test('Verify if Filtering by cluster type works correctly', async () => {
    const { container, getByText, getAllByText } = render(<WrapperComponent {...initialProps} />)

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
    const knownClusterTypeMockedData = mockedLogAnalysisData.resource.content.filter(
      el => el.clusterType === 'KNOWN_EVENT'
    )
    await waitFor(() => expect(getAllByText('Known')).toHaveLength(knownClusterTypeMockedData.length))

    // Selecting UnKnown event cluster type
    const unknownEventTypeSelected = await getByText('pipeline.verification.logs.unknownEvent')
    act(() => {
      fireEvent.click(unknownEventTypeSelected)
    })
    expect(clusterTypeFilterDropdown.value).toBe('pipeline.verification.logs.unknownEvent')

    // Verifying if correct number of records are shown for unKnown event type.
    const unknownClusterTypeMockedData = mockedLogAnalysisData.resource.content.filter(
      el => el.clusterType === 'UNKNOWN_EVENT'
    )
    await waitFor(() => expect(getAllByText('Unknown')).toHaveLength(unknownClusterTypeMockedData.length))
  })
})
