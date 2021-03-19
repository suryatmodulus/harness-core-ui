import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import LoginPage from './LoginPage'

describe('Login Page', () => {
  test('The login page renders', () => {
    const { container } = render(
      <TestWrapper path={routes.toLogin()}>
        <LoginPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
