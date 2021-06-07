import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useResendVerifyEmail } from 'services/cd-ng'

import { EmailVerificationBanner } from '../EmailVerificationBanner'

jest.mock('services/cd-ng')
const useResendEmailMock = useResendVerifyEmail as jest.MockedFunction<any>

describe('EmailVerificationBanner', () => {
  test('render', () => {
    useResendEmailMock.mockImplementation(() => {
      return {
        cancel: jest.fn(),
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS'
          }
        })
      }
    })
    const { container, getByText } = render(
      <TestWrapper>
        <EmailVerificationBanner />
      </TestWrapper>
    )
    expect(getByText('common.banners.email.description')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('email verify success', async () => {
    useResendEmailMock.mockImplementation(() => {
      return {
        cancel: jest.fn(),
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS'
          }
        })
      }
    })
    const { container, getByText } = render(
      <TestWrapper>
        <EmailVerificationBanner />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.banners.email.resend'))
    await waitFor(() => expect(useResendEmailMock).toBeCalled())
    expect(getByText('common.banners.email.success')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('email verify fails', async () => {
    useResendEmailMock.mockImplementation(() => {
      return {
        mutate: jest.fn().mockRejectedValue({
          data: {
            message: 'email verify failed'
          }
        })
      }
    })
    const { container, getByText } = render(
      <TestWrapper>
        <EmailVerificationBanner />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.banners.email.resend'))
    await waitFor(() => expect(useResendEmailMock).toBeCalled())
    expect(getByText('email verify failed')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
