import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CIGovernancePage from '../CIGovernancePage'

describe('CIGovernancePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CIGovernancePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
