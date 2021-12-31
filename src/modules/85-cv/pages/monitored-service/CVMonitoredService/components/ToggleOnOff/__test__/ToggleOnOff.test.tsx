import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ToggleOnOff from '../ToggleOnOff'

describe('ToggleOnOff', () => {
  test('should have disabled class if the disabled prop is true', () => {
    const { container } = render(
      <TestWrapper>
        <ToggleOnOff disabled onChange={jest.fn()} />
      </TestWrapper>
    )

    expect(container.querySelector('.disabled')).toBeInTheDocument()
  })
})
