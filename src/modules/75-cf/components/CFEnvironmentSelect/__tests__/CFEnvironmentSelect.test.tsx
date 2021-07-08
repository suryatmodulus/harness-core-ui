import React from 'react'
import { render, screen } from '@testing-library/react'
import { CFEnvironmentSelect } from '@cf/components/CFEnvironmentSelect/CFEnvironmentSelect'
import { TestWrapper } from '@common/utils/testUtils'

describe('CFEnvironmentSelect', () => {
  test('it should render the passed component with the label', async () => {
    render(<CFEnvironmentSelect component={<span data-testid="test-component">Test component</span>} />, {
      wrapper: TestWrapper
    })

    expect(screen.getByTestId('test-component')).toBeInTheDocument()
    expect(screen.getByText('environment')).toBeInTheDocument()
  })
})
