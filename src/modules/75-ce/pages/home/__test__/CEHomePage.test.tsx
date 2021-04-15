import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CEHomePage from '../CEHomePage'

describe('CEHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CEHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
