import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SummaryOfDeployedNodes } from '../SummaryOfDeployedNodes'

// eslint-disable-next-line no-var
var mockedUseQueryParam = jest.fn().mockImplementation(() => ({ returnUrl: '/testing' }))
jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useQueryParams: mockedUseQueryParam
}))

describe('Unit tests for SummaryOfDeployedNodes', () => {
  test('Ensure content is rendered correctly based on input', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <SummaryOfDeployedNodes
          metricsInViolation={3}
          totalMetrics={20}
          logClustersInViolation={5}
          totalLogClusters={5}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('pipeline.verification.metricsInViolation')).not.toBeNull())
    expect(container).toMatchSnapshot()
    fireEvent.click(container.querySelector('[class*="viewDetails"]')!)
  })
})
