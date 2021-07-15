import React from 'react'
import { render } from '@testing-library/react'
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
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationView step={{}} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
