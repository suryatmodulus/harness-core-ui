import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper, queryByNameAttribute } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { useSignupUser } from 'services/portal'

import routes from '@common/RouteDefinitions'
import SignupPage from './SignupPage'

jest.mock('services/portal')
const useSignupUserMock = useSignupUser as jest.MockedFunction<any>

describe('Signup Page', () => {
  test('The signup page renders ', () => {
    useSignupUserMock.mockImplementation(() => {
      return {
        loading: false,
        mutate: jest.fn().mockImplementationOnce(() => {
          return {
            resource: {
              defaultAccountId: 'account1',
              token: 'token-1234',
              uuid: 'uuid-1234'
            }
          }
        })
      }
    })
    const { container } = render(
      <TestWrapper path={routes.toSignup()} defaultAppStoreValues={defaultAppStoreValues}>
        <SignupPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  describe('handleSubmit', () => {
    test('should show error when api fails', async () => {
      useSignupUserMock.mockImplementation(() => {
        return {
          loading: false,
          mutate: jest.fn().mockRejectedValue(() => {
            return {
              error: {
                message: 'api call failed'
              }
            }
          })
        }
      })
      const { container, getByText } = render(
        <TestWrapper path={routes.toSignup()} defaultAppStoreValues={defaultAppStoreValues}>
          <SignupPage />
        </TestWrapper>
      )
      fireEvent.input(queryByNameAttribute('email', container)!, {
        target: { value: 'random@hotmail.com' },
        bubbles: true
      })
      fireEvent.input(queryByNameAttribute('password', container)!, {
        target: { value: '12345678' },
        bubbles: true
      })
      fireEvent.click(getByText('signUp.signUp'))
      await waitFor(() => expect(getByText('error')).toBeDefined())
      expect(container).toMatchSnapshot()
    })
  })
})
