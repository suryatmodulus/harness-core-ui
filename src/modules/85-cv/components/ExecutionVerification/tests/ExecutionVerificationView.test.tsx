import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionVerificationView } from '../ExecutionVerificationView'

jest.mock('../components/DeploymentMetrics/DeploymentMetrics', () => ({
  ...(jest.requireActual('../components/DeploymentMetrics/DeploymentMetrics') as any),
  DeploymentMetrics: () => <div className="deploymentMetrics" />
}))

jest.mock('../components/ExecutionVerificationSummary/ExecutionVerificationSummary', () => ({
  ExecutionVerificationSummary: () => <div className="summary" />
}))

describe('Unit tests for ExecutionVerificationView unit tests', () => {
  test('Ensure tabs are rendered', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationView step={{ progressData: { activityId: '1234_activityId' as any } }} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="bp3-tabs"]')).not.toBeNull())
    expect(getByText('pipeline.verification.analysisTab.logs')).not.toBeNull()
    expect(getByText('pipeline.verification.analysisTab.metrics')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })
  test('Ensure no analysis state is rendered when activity id does not exist', async () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationView step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="noAnalysis"]')))
    expect(container.querySelector('[class*="bp3-tabs"]')).toBeNull()
    expect(container).toMatchSnapshot()
  })
})
