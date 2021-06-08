import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AdminPage from '../AdminPage'

jest.mock('services/cd-ng', () => ({
  useResendVerifyEmail: () => {
    return {
      mutate: jest.fn(),
      loading: false
    }
  }
}))

describe('Admin Page', () => {
  describe('Rendering', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })

    test('should render email verification banner when user is not verified', () => {
      const { container, getByText } = render(
        <TestWrapper
          defaultAppStoreValues={{
            currentUserInfo: {
              emailVerified: false
            }
          }}
        >
          <AdminPage />
        </TestWrapper>
      )
      expect(getByText('common.banners.email.description')).toBeDefined()
      expect(container).toMatchSnapshot()
    })
  })
})
