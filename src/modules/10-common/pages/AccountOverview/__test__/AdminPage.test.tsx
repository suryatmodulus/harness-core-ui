import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AdminPage from '../AccountOverview'

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
  })
})
