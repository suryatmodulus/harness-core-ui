import { render } from '@testing-library/react'
import React from 'react'
import { DeploymentMetrics } from '../DeploymentMetrics'

describe('Unit tests for Deployment metrics', () => {
  test('Ensure file renders correctly', async () => {
    const { container } = render(<DeploymentMetrics />)
    expect(container).toMatchSnapshot()
  })
})
