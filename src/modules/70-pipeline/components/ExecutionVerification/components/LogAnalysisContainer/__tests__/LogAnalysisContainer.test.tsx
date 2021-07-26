import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ExecutionNode } from 'services/pipeline-ng'
import { mockedLogAnalysisData, mockedLogChartsData } from './LogAnalysisContainer.mocks'
import LogAnalysisContainer from '../LogAnalysisView.container'
import type { LogAnalysisContainerProps } from '../LogAnalysis.types'

const WrapperComponent = (props: LogAnalysisContainerProps): JSX.Element => {
  return (
    <TestWrapper
      pathParams={{
        accountId: '1234_accountId',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG'
      }}
    >
      <LogAnalysisContainer {...props} />
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useGetDeploymentLogAnalysisResult: jest.fn().mockImplementation(() => {
    return { data: mockedLogAnalysisData, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDeploymentLogAnalysisClusters: jest.fn().mockImplementation(() => {
    return { data: mockedLogChartsData, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('Unit tests for LogAnalysisContainer', () => {
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

    // Verify if number of records returned by the api for the first page maatches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(mockedLogAnalysisData.resource.content.length)
    )
  })
})
