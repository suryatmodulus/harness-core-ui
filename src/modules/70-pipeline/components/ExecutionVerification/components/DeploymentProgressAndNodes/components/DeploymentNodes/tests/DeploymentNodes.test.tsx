import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { DeploymentNodes } from '../DeploymentNodes'

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
    const healthNodes = [
      { health: 'LOW', nodeName: 'smeName', anomalousMetrics: 2, anomalousLogClusters: 4 },
      { health: 'HIGH', nodeName: 'smeName', anomalousMetrics: 5, anomalousLogClusters: 6 },
      { health: 'MEDIUM', nodeName: 'smeName', anomalousMetrics: 2, anomalousLogClusters: 7 },
      { health: '', nodeName: 'smeName', anomalousMetrics: 1, anomalousLogClusters: 9 }
    ]
    const { container } = render(<DeploymentNodes totalNodes={15} nodeHealth={healthNodes} />)
    await waitFor(() => expect(container.querySelectorAll('[class*="nodeHealth"]').length).toBe(healthNodes.length))
  })
})
