import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useResendEmail } from 'services/portal'

import { useVerifyEmailModal } from '../useVerifyEmailModal'

jest.mock('services/portal')
const useResendEmailMock = useResendEmail as jest.MockedFunction<any>

const onCloseModal = jest.fn()
const TestComponent = (): React.ReactElement => {
  const { openEmailVerifyModal, closeEmailVerifyModal } = useVerifyEmailModal({ onCloseModal })
  return (
    <>
      <button className="open" onClick={openEmailVerifyModal} />
      <button className="close" onClick={closeEmailVerifyModal} />
    </>
  )
}

const currentUserInfo = {
  email: 'hello@world.com'
}

describe('useVerifyEmailModal', () => {
  describe('Rendering', () => {
    test('should open and close Verify Email Modal', async () => {
      useResendEmailMock.mockImplementation(() => {
        return {
          mutate: jest.fn(),
          loading: false
        }
      })
      const { container, getByText, getByRole } = render(
        <TestWrapper defaultAppStoreValues={{ currentUserInfo }}>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('common.banners.trial.verifyEmail.title')).toBeDefined())
      expect(container).toMatchSnapshot()
      fireEvent.click(getByRole('button', { name: 'close modal' }))
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })
  })

  describe('Event', () => {
    test('should show send verify email success when api call succeeds', async () => {
      const resendEmailmock = jest.fn().mockImplementation(() => {
        return {
          status: 'SUCCESS'
        }
      })
      useResendEmailMock.mockImplementation(() => {
        return {
          mutate: resendEmailmock,
          loading: false
        }
      })
      const { container, getByText } = render(
        <TestWrapper defaultAppStoreValues={{ currentUserInfo }}>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => fireEvent.click(getByText('common.banners.trial.verifyEmail.resend')))
      await waitFor(() => expect(resendEmailmock).toHaveBeenCalled())
      expect(() => getByText('common.banners.trial.verifyEmail.resendSuccess')).toBeDefined()
    })

    test('should show send verify email fail when api call fails', async () => {
      const resendEmailmock = jest.fn().mockImplementation(() => {
        return {
          mutate: jest.fn().mockRejectedValue({
            data: {
              message: 'resend email failed'
            }
          })
        }
      })
      useResendEmailMock.mockImplementation(() => {
        return {
          mutate: resendEmailmock,
          loading: false
        }
      })
      const { container, getByText } = render(
        <TestWrapper defaultAppStoreValues={{ currentUserInfo }}>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => fireEvent.click(getByText('common.banners.trial.verifyEmail.resend')))
      await waitFor(() => expect(resendEmailmock).toHaveBeenCalled())
      expect(() => getByText('resend email failed')).toBeDefined()
    })
  })
})
