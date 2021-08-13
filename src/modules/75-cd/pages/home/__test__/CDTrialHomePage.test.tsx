import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CDTrialHomePage from '../CDTrialHomePage'

describe('CDTrialHomePage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <CDTrialHomePage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should pop up start trial modal if there is queryparam source value signup', () => {
    const { container, getByText } = render(
      <TestWrapper queryParams={{ source: 'signup' }}>
        <CDTrialHomePage />
      </TestWrapper>
    )
    expect(getByText('common.purpose.welcome')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
