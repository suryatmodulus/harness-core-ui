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
          primaryNodeProps={{
            totalNodes: 15,
            nodeHealth: [{ health: 'LOW', nodeName: 'someName', anomalousLogClusters: 2, anomalousMetrics: 3 }]
          }}
          canaryNodeProps={{
            totalNodes: 10,
            nodeHealth: [{ health: 'MEDIUM', nodeName: 'anotherName', anomalousLogClusters: 7, anomalousMetrics: 3 }]
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('primary'.toLocaleUpperCase())).not.toBeNull())
    await waitFor(() => expect(getByText('canary'.toLocaleUpperCase())).not.toBeNull())
    await waitFor(() => expect(container.querySelectorAll('[class*="nodeHealth"]').length).toBe(2))
  })
})
