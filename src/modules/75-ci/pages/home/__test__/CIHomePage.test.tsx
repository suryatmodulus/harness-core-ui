import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CIHomePage from '../CIHomePage'

describe('CIHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CIHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
