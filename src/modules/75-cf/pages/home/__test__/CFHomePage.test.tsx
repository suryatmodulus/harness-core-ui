import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CFHomePage from '../CFHomePage'

describe('CFHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CFHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
