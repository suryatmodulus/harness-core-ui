import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DeploymentNodes } from '../DeploymentNodes'
import type { DeploymentNodeAnalysisResult } from '../DeploymentNodes.constants'

describe('Unit tests for Deployment Nodes', () => {
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
  test('Ensure nodes are rendered based on input', async () => {
    const healthNodes: DeploymentNodeAnalysisResult[] = [
      { risk: 'LOW', hostName: 'node1', anomalousMetricsCount: 2, anomalousLogClustersCount: 4 },
      { risk: 'HIGH', hostName: 'node5', anomalousMetricsCount: 5, anomalousLogClustersCount: 6 },
      { risk: 'MEDIUM', hostName: 'node16', anomalousMetricsCount: 2, anomalousLogClustersCount: 7 },
      { risk: 'NO_ANALYSIS', hostName: 'node23', anomalousMetricsCount: 1, anomalousLogClustersCount: 9 },
      { risk: 'NO_DATA', hostName: 'node23', anomalousMetricsCount: 1, anomalousLogClustersCount: 9 },
      { hostName: 'node23', anomalousMetricsCount: 1, anomalousLogClustersCount: 9 } as DeploymentNodeAnalysisResult
    ]
    const { container, getByText } = render(
      <TestWrapper>
        <DeploymentNodes nodes={healthNodes} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelectorAll('[class~="nodeHealth"]').length).toBe(healthNodes.length))
    expect(container.querySelectorAll('[class~="hexagon"]').length).toBe(6)
    expect(container.querySelectorAll('[data-node-health-color="var(--green-500)"]').length).toBe(1)
    expect(container.querySelectorAll('[data-node-health-color="var(--red-500)"]').length).toBe(1)
    expect(container.querySelectorAll('[data-node-health-color="var(--grey-300)"]').length).toBe(2)
    expect(container.querySelectorAll('[data-node-health-color="var(--yellow-500)"]').length).toBe(1)

    // make sure popover has right contents
    fireEvent.mouseOver(container.querySelector('[class*="hexagonContainer"]')!)
    await waitFor(() => expect(document.body.querySelector('[class*="nodeHealthPopoverContent"]')).not.toBeNull())
    getByText('2 pipeline.verification.metricsInViolation')
    expect(document.body.querySelector('[class*="nodeHealthPopoverContent"] [class*="nodeHealth"]')).not.toBeNull()
  })
})
