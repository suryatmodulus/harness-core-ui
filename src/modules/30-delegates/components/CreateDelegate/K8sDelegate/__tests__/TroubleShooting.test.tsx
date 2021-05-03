import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import TroubleShooting from '../DelegateInstallationError/TroubleShooting'

describe('Create Common Problems Tab', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('show event error btn', () => {
    const { container } = render(
      <TestWrapper>
        <TroubleShooting />
      </TestWrapper>
    )
    const noBtn = container.querySelector('.noBtn')
    fireEvent.click(noBtn!)
    expect(container).toMatchSnapshot()
  })
})
