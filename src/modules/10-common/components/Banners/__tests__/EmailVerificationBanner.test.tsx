/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useResendVerifyEmail } from 'services/cd-ng'

import { EmailVerificationBanner } from '../EmailVerificationBanner'

jest.mock('services/cd-ng')
const useResendEmailMock = useResendVerifyEmail as jest.MockedFunction<any>

const currentUserInfo = {
  emailVerified: false
}

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
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUserInfo }}>
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
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUserInfo }}>
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
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUserInfo }}>
        <EmailVerificationBanner />
      </TestWrapper>
    )
    fireEvent.click(getByText('common.banners.email.resend'))
    await waitFor(() => expect(useResendEmailMock).toBeCalled())
    expect(getByText('email verify failed')).toBeDefined()
    expect(container).toMatchSnapshot()
  })

  test('when currentUserInfo doesnot exist, should not display', () => {
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
    const { container, queryByText } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: {} }}>
        <EmailVerificationBanner />
      </TestWrapper>
    )
    expect(queryByText('common.banners.email.description')).toBeNull()
    expect(container).toMatchSnapshot()
  })
})
