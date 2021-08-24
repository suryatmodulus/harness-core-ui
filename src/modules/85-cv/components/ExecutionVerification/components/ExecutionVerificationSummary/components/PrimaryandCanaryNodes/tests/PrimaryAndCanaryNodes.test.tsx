import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PrimaryAndCanaryNodes } from '../PrimaryAndCanaryNodes'

describe('Unit tests for PrimaryAndCanaryNodes', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      } as any
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('Ensure that passed in data is rendered correctly', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <PrimaryAndCanaryNodes
          primaryNodes={[{ risk: 'LOW', hostName: 'someName', anomalousLogClustersCount: 2, anomalousMetricsCount: 3 }]}
          primaryNodeLabel="before"
          canaryNodeLabel="after"
          canaryNodes={[
            { risk: 'MEDIUM', hostName: 'anotherName', anomalousLogClustersCount: 7, anomalousMetricsCount: 3 }
          ]}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('BEFORE')).not.toBeNull())
    await waitFor(() => expect(getByText('AFTER')).not.toBeNull())
    await waitFor(() => expect(container.querySelectorAll('[class~="nodeHealth"]').length).toBe(2))
  })
})
