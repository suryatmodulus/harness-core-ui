import React from 'react'
import { render, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { setFieldValue, InputTypes, clickSubmit } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import AppStorage from 'framework/utils/AppStorage'
import LoginPage from './LoginPage'

const localGlobal = global as Record<string, any>
localGlobal.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true
  })
)

describe('Login Page', () => {
  test('The login page renders', () => {
    const { container } = render(
      <TestWrapper path={routes.toLogin()}>
        <LoginPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  }),
    test('submit the form', async () => {
      const { container } = render(
        <TestWrapper path={routes.toLogin()}>
          <LoginPage />
        </TestWrapper>
      )

      setFieldValue({ container: container!, type: InputTypes.TEXTFIELD, fieldId: 'email', value: 'admin@harness.io' })
      setFieldValue({ container: container!, type: InputTypes.TEXTFIELD, fieldId: 'password', value: 'admin' })

      await act(async () => {
        clickSubmit(container!)
      })

      expect(AppStorage.has('token')).toBeFalsy()
    })
})
