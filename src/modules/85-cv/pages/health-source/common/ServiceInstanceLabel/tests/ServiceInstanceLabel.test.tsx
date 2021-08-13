import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ServiceInstanceLabel } from '../ServiceInstanceLabel'

describe('Unit tests for ServiceInstanceLabel', () => {
  test('Ensure label is rendered correctly', async () => {
    const { container } = render(
      <TestWrapper>
        <ServiceInstanceLabel />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
